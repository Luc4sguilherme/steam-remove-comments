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
  etaBuffer: 10,
});

const getCommentsOnMyProfile = util.promisify(
  community.getUserComments.bind(community)
);
const deleteComment = util.promisify(
  community.deleteUserComment.bind(community)
);

async function removeChunk(comments) {
  const task = async (comment, retries = 0, maxRetries = 5) => {
    try {
      await deleteComment(comment.steamId, comment.commentId);
      progressBar.increment();
      return 1;
    } catch (err) {
      if (retries < maxRetries) {
        await delay(1000 * retries);
        return task(comment, retries + 1);
      }
      return 0;
    }
  };

  const chunks = _.chunk(comments, config.batch || 10);
  let removed = 0;

  for (let i = 0; i < chunks.length; i += 1) {
    const results = await Promise.allSettled(chunks[i].map(task));

    removed += results.reduce(
      (sum, r) => sum + (r.status === 'fulfilled' ? r.value : 0),
      0
    );

    if (i < chunks.length - 1) {
      await delay(config.delay || 5000);
    }
  }

  return removed;
}

export default async (mode, filter) => {
  let spinner;

  try {
    const steamId = client.steamID.toString();
    const modeLabel =
      mode === 1
        ? 'comments you made on other profiles'
        : 'comments made on your profile';

    spinner = ora(`Fetching ${modeLabel}...`).start();

    if (mode === 1) {
      let totalComments = 0;
      let commentsRemoved = 0;

      for await (const { page, comments } of getMyComments(community)) {
        const filtered = comments.filter((c) => c.steamId !== steamId);

        if (filtered.length > 0) {
          totalComments += filtered.length;

          spinner.start(
            `Processing page ${page} (${filtered.length} comments)...`
          );

          progressBar.start(filtered.length, 0);
          commentsRemoved += await removeChunk(filtered);
          progressBar.stop();
        }
      }

      if (totalComments === 0) {
        spinner.warn('No comments found to remove.');
        return;
      }

      if (commentsRemoved > 0) {
        spinner.succeed(
          `Operation completed: ${commentsRemoved}/${totalComments} comment(s) removed successfully.`
        );
      }
    }

    if (mode === 2) {
      const rawComments = await getCommentsOnMyProfile(steamId);
      const comments = rawComments
        .map((comment) => ({
          steamId: steamId.toString(),
          authorId: comment.author.steamID.toString(),
          commentId: comment.id,
        }))
        .filter((c) => {
          if (filter === 'others') {
            return c.authorId !== steamId;
          }

          if (filter === 'mine') {
            return c.authorId === steamId;
          }

          return c;
        });

      if (comments.length === 0) {
        spinner.warn('No comments found to remove.');
        return;
      }

      spinner.info(`Found ${comments.length} comment(s). Starting removal...`);

      progressBar.start(comments.length, 0);
      const commentsRemoved = await removeChunk(comments);
      progressBar.stop();

      if (commentsRemoved > 0) {
        spinner.succeed(
          `Operation completed: ${commentsRemoved}/${comments.length} comment(s) removed successfully.`
        );
      }
    }
  } catch (error) {
    progressBar.stop();
    spinner.fail(`Failed to remove comments: ${error.message || error}`);
  }
};
