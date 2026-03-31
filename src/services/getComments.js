import util from 'util';

import { delay } from '../utils/delay.js';

export async function getComments(
  community,
  steamId,
  options,
  retries = 0,
  maxRetries = 5
) {
  const getUserComments = util.promisify(
    community.getUserComments.bind(community)
  );

  try {
    return await getUserComments(steamId, options);
  } catch (err) {
    if (retries < maxRetries) {
      await delay(5000 * retries);
      return getComments(community, steamId, options, retries + 1, maxRetries);
    }

    console.error(
      `An error occurred while retrieving comments for ${steamId}.`,
      err
    );

    return [];
  }
}

export async function* getCommentsGenerator(community, steamId) {
  let page = 1;
  let start = 0;

  do {
    const comments = await getComments(community, steamId, {
      count: 50,
      start,
    });

    if (comments.length === 0) break;

    yield { page, comments };

    page += 1;
    start += comments.length;
  } while (true);
}
