import ProgressBar from 'cli-progress';
import _ from 'lodash';
import ora from 'ora';
import util from 'util';

import config from '../config/main.js';
import getMyComments from './getMyComments.js';
import { client, community } from './steamClient.js';
import { delay } from './utils.js';

const progressBar = new ProgressBar.Bar({
  format:
    'Removing comments |{bar}| {value}/{total} ({percentage}%) | ETA: {eta_formatted}',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  clearOnComplete: true,
  emptyOnZero: true,
  etaBuffer: 5,
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
    const comments = await getCommentsMadeByMe();
    return comments.filter((comment) => comment.steamId !== steamId);
  }

  const comments = await getCommentsOnMyProfile(steamId);
  return comments.map((comment) => ({
    steamId,
    commentId: comment.id,
  }));
}

export default async (mode) => {
  let spinner;

  try {
    const modeLabel =
      mode === 1
        ? 'comments you made on other profiles'
        : 'comments made on this profile';

    spinner = ora(`Fetching ${modeLabel}...`).start();

    const comments = await getComments(mode, client.steamID.toString());

    if (comments.length === 0) {
      spinner.warn('No comments found to remove.');
      return;
    }

    spinner.info(`Found ${comments.length} comment(s). Starting removal...`);

    let commentsRemoved = 0;

    progressBar.start(comments.length, 0);

    const task = async (comment, retries = 0) => {
      const maxRetries = 5;

      try {
        await deleteComment(comment.steamId, comment.commentId);
        progressBar.increment();
        commentsRemoved += 1;
      } catch (err) {
        if (retries < maxRetries) {
          await delay(1000 * retries);
          task(comment, retries + 1);
        }
      }
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
      spinner.succeed(
        `Operation completed: ${commentsRemoved}/${comments.length} comment(s) removed successfully.`
      );
    }
  } catch (error) {
    progressBar.stop();
    spinner.fail(`Failed to remove comments: ${error.message || error}`);
  }
};
