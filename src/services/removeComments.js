import _ from 'lodash';
import util from 'util';

import config from '../config/main.js';
import { delay } from '../utils/delay.js';
import getCommentsOnMyProfile from './getCommentsOnMyProfile.js';
import getMyComments from './getMyComments.js';

async function removeChunk({ community, comments, onItemRemoved }) {
  const deleteComment = util.promisify(
    community.deleteUserComment.bind(community)
  );

  const task = async (comment, retries = 0, maxRetries = 5) => {
    try {
      await deleteComment(comment.profileId, comment.commentId);
      onItemRemoved();
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

export async function removeMyComments({
  community,
  steamId,
  onPage,
  onProgress,
}) {
  let totalComments = 0;
  let commentsRemoved = 0;

  for await (const { page, comments } of getMyComments(community, steamId)) {
    if (comments.length > 0) {
      totalComments += comments.length;
      onPage(page, comments.length);

      let progress = 0;
      commentsRemoved += await removeChunk({
        community,
        comments,
        onItemRemoved: () => {
          progress += 1;
          onProgress(progress, comments.length);
        },
      });
    }
  }

  return { removed: commentsRemoved, total: totalComments };
}

export async function removeCommentsFromMyProfile({
  community,
  steamId,
  filter,
  onPage,
  onProgress,
}) {
  let totalComments = 0;
  let commentsRemoved = 0;

  for await (const { page, comments } of getCommentsOnMyProfile(
    community,
    filter,
    steamId
  )) {
    if (comments.length > 0) {
      totalComments += comments.length;
      onPage(page, comments.length);

      let progress = 0;
      commentsRemoved += await removeChunk({
        community,
        comments,
        onItemRemoved: () => {
          progress += 1;
          onProgress(progress, comments.length);
        },
      });
    }
  }

  return { removed: commentsRemoved, total: totalComments };
}
