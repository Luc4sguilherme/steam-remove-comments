import { load } from 'cheerio';

import { delay } from '../utils/delay.js';

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

function collectProfileLinks($, visitedProfiles) {
  const matchLink =
    /https:\/\/steamcommunity\.com\/(id|profiles)\/[^/]+\/?(?:\?tscn=\d+)?$/;
  const newProfiles = [];

  $('div.commenthistory_comment:not(.deleted) a').each((i, el) => {
    const href = $(el).attr('href');
    if (href && matchLink.test(href)) {
      const normalized = href.replace(/\/$/, '');
      if (!visitedProfiles.has(normalized)) {
        visitedProfiles.add(normalized);
        newProfiles.push(normalized);
      }
    }
  });

  return newProfiles;
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

async function fetchHistoryPage(
  steamcommunity,
  page,
  retries = 0,
  maxRetries = 5
) {
  try {
    return await new Promise((resolve, reject) => {
      // eslint-disable-next-line no-underscore-dangle
      steamcommunity._myProfile(
        `commenthistory?p=${page}`,
        null,
        (err, response, body) => {
          if (err) reject(err);
          else resolve(body);
        }
      );
    });
  } catch (err) {
    if (retries < maxRetries) {
      await delay(5000 * retries);
      return fetchHistoryPage(steamcommunity, page, retries + 1, maxRetries);
    }

    return null;
  }
}

async function fetchProfile(steamcommunity, url, retries = 0, maxRetries = 5) {
  try {
    return await new Promise((resolve, reject) => {
      steamcommunity.httpRequest(
        url,
        (err, response, body) => {
          if (err) reject(err);
          else resolve(body);
        },
        'steamcommunity'
      );
    });
  } catch (err) {
    if (retries < maxRetries) {
      await delay(1000 * retries);
      return fetchProfile(steamcommunity, url, retries + 1, maxRetries);
    }

    return null;
  }
}

/**
 * Async generator that yields comments page by page from the comment history.
 * Each iteration yields { page, comments } for one history page.
 * @param {object} steamcommunity
 * @param {object} [options]
 * @param {number} [options.startPage=1] - The page to start from (1-indexed)
 * @param {number} [options.endPage] - The page to end at. Defaults to last page.
 */
async function* getMyComments(steamcommunity, options = {}) {
  const visitedProfiles = new Set();
  const seenComments = new Set();
  let endPage = null;
  let page = options.startPage || 1;

  while (endPage === null || page <= endPage) {
    const body = await fetchHistoryPage(steamcommunity, page);

    if (body === null && endPage === null) {
      throw new Error(`Failed to fetch comment history page ${page}`);
    }

    if (body !== null) {
      const $ = load(body);

      if (endPage === null) {
        endPage = options.endPage || getEndPage($, page);
      }

      const profileLinks = collectProfileLinks($, visitedProfiles);
      const comments = [];

      for (const profileLink of profileLinks) {
        const profileBody = await fetchProfile(steamcommunity, profileLink);

        if (profileBody !== null) {
          const profileComments = findOwnComments(load(profileBody));
          for (const comment of profileComments) {
            if (!seenComments.has(comment.commentId)) {
              seenComments.add(comment.commentId);
              comments.push(comment);
            }
          }
        }
      }

      if (comments.length > 0) {
        yield { page, comments };
      }
    }

    page += 1;
  }
}

export default getMyComments;
