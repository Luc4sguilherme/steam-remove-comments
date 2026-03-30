import { load } from 'cheerio';

import { delay } from './utils.js';

/**
 * Get all comments made by the currently logged-in user on other users' profiles.
 * Retrieves the comment history HTML pages and collects the comments.
 * @param {object} [options]
 * @param {number} [options.startPage=1] - The page to start from (1-indexed)
 * @param {number} [options.endPage] - The page to end at. Defaults to last page.
 * @param {function} callback - Called with (err, comments)
 */
const getMyComments = (steamcommunity) => (opts, cb) => {
  const callback = typeof opts === 'function' ? opts : cb;
  const options = typeof opts === 'function' ? {} : opts || {};

  const startPage = options.startPage || 1;
  const profileURLs = new Set();
  const allComments = [];

  function getEndPage($, fallback) {
    const pageLinks = $('div.pageLinks a.pagelink');
    if (pageLinks.length > 0) {
      const parsed = parseInt(pageLinks.last().text().replace(/[,.]/g, ''), 10);
      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
    return fallback;
  }

  function collectProfileLinks($) {
    const matchLink =
      /https:\/\/steamcommunity\.com\/(id|profiles)\/[^/]+\/?(?:\?tscn=\d+)?$/;

    $('div.commenthistory_comment:not(.deleted) a').each((i, el) => {
      const href = $(el).attr('href');
      if (href && matchLink.test(href)) {
        profileURLs.add(href.replace(/\/$/, ''));
      }
    });
  }

  function findOwnComments($) {
    const results = [];
    const seen = new Set();

    $('a.actionlink:not(.report_and_hide)').each((i, el) => {
      const href = $(el).attr('href') || '';
      const matches = href.match(/'([^']+)'/g);
      if (matches && matches.length >= 2) {
        const steamId = matches[0].replace(/'/g, '').replace('Profile_', '');
        const commentId = matches[1].replace(/'/g, '');
        if (!seen.has(commentId)) {
          seen.add(commentId);
          results.push({ steamId, commentId });
        }
      }
    });

    return results;
  }

  function processProfiles(profiles, index) {
    if (index >= profiles.length) {
      callback(null, allComments);
      return;
    }

    steamcommunity.httpRequest(
      profiles[index],
      (err, response, body) => {
        if (err) {
          processProfiles(profiles, index + 1);
          return;
        }

        const comments = findOwnComments(load(body));
        comments.forEach((c) => {
          allComments.push(c);
        });

        processProfiles(profiles, index + 1);
      },
      'steamcommunity'
    );
  }

  function fetchHistoryPage(page, initialEndPage, retries = 0) {
    const maxRetries = 5;

    let endPage = initialEndPage;

    if (endPage !== null && page > endPage) {
      processProfiles(Array.from(profileURLs), 0);
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    steamcommunity._myProfile(
      `commenthistory?p=${page}`,
      null,
      async (err, response, body) => {
        if (err) {
          if (retries < maxRetries) {
            await delay(5000 * retries);
            fetchHistoryPage(page, endPage, retries + 1);
          } else if (endPage === null) {
            callback(err);
          } else {
            fetchHistoryPage(page + 1, endPage);
          }
          return;
        }

        const $ = load(body);
        collectProfileLinks($);

        if (endPage === null) {
          endPage = options.endPage || getEndPage($, page);
        }

        fetchHistoryPage(page + 1, endPage);
      }
    );
  }

  fetchHistoryPage(startPage, null);
};

export default getMyComments;
