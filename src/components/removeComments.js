import ProgressBar from 'cli-progress';
import _ from 'lodash';
import util from 'util';

import config from '../config/main.js';
import getMyComments from './getMyComments.js';
import log from './log.js';
import { client, community } from './steamClient.js';
import { delay } from './utils.js';

const progressBar = new ProgressBar.Bar({
  format: 'Removing comments [{bar}] {percentage}% ',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  clearOnComplete: true,
  emptyOnZero: true,
});

const getCommentsOnMyProfile = util.promisify(
  community.getUserComments.bind(community)
);
const getCommentsMadeByMe = util.promisify(getMyComments(community));
const deleteComment = util.promisify(
  community.deleteUserComment.bind(community)
);

async function getComments(mode, steamId) {
  if (mode === 1) {
    return getCommentsMadeByMe();
  }

  const comments = await getCommentsOnMyProfile(steamId);
  return comments.map((comment) => ({
    steamId,
    commentId: comment.id,
  }));
}

export default async (mode) => {
  try {
    const modeLabel =
      mode === 1
        ? 'comments you made on other profiles'
        : 'comments made on this profile';

    log.info(`Fetching ${modeLabel}...`);

    const comments = await getComments(mode, client.steamID);

    if (comments.length === 0) {
      log.info('No comments found to remove.');
      return;
    }

    log.info(`Found ${comments.length} comment(s). Starting removal...`);

    let commentsRemoved = 0;

    console.clear();
    progressBar.start(comments.length, 0);

    const task = async (comment) => {
      await deleteComment(comment.steamId, comment.commentId);
      progressBar.increment();
      commentsRemoved += 1;
    };

    const chunks = _.chunk(comments, config.batch || 10);

    for (let i = 0; i < chunks.length; i += 1) {
      await Promise.allSettled(chunks[i].map(task));

      if (i < chunks.length - 1) {
        await delay(config.delay || 5000);
      }
    }

    progressBar.stop();

    if (commentsRemoved > 0) {
      log.info(
        `Operation completed: ${commentsRemoved}/${comments.length} comment(s) removed successfully.`
      );
    }
  } catch (error) {
    console.clear();
    log.error(`Failed to remove comments: ${error.message || error}`);
  }
};
