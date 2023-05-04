import ProgressBar from 'cli-progress';
import _ from 'lodash';
import util from 'util';

import log from './log.js';
import { client, community } from './steamClient.js';

const getComments = util.promisify(community.getUserComments.bind(community));
const deleteComments = util.promisify(
  community.deleteUserComment.bind(community)
);

const progressBar = new ProgressBar.Bar({
  format: 'Removing comments [{bar}] {percentage}% ',
  barCompleteChar: '\u2588',
  barIncompleteChar: '\u2591',
  hideCursor: true,
  clearOnComplete: true,
  emptyOnZero: true,
});

export default async () => {
  try {
    const comments = await getComments(client.steamID);
    let commentsRemoved = 0;

    progressBar.start(comments.length, 0);

    const task = async (comment) => {
      await deleteComments(client.steamID, comment.id);
      progressBar.increment();
      commentsRemoved += 1;
    };

    for (const chunk of _.chunk(comments, 10)) {
      await Promise.allSettled(chunk.map(task));
    }

    progressBar.stop();

    log.info(
      `Operation performed successfully: ${commentsRemoved} comment(s) removed.`
    );
  } catch (error) {
    console.clear();
    log.error(error);
  }
};
