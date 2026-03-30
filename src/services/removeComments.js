import _ from 'lodash';
import util from 'util';

import config from '../config/main.js';
import { delay } from '../utils/delay.js';
import getMyComments from './getMyComments.js';

async function removeChunk({ comments, deleteComment, onItemRemoved }) {
  const task = async (comment, retries = 0, maxRetries = 5) => {
    try {
      await deleteComment(comment.steamId, comment.commentId);
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
  const deleteComment = util.promisify(
    community.deleteUserComment.bind(community)
  );

  let totalComments = 0;
  let commentsRemoved = 0;

  for await (const { page, comments } of getMyComments(community)) {
    const filtered = comments.filter((c) => c.steamId !== steamId);

    if (filtered.length > 0) {
      totalComments += filtered.length;
      onPage(page, filtered.length);

      let pageCurrent = 0;
      commentsRemoved += await removeChunk({
        comments: filtered,
        deleteComment,
        onItemRemoved: () => {
          pageCurrent += 1;
          onProgress(pageCurrent, filtered.length);
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
  onStart,
  onProgress,
}) {
  const deleteComment = util.promisify(
    community.deleteUserComment.bind(community)
  );
  const getCommentsOnMyProfile = util.promisify(
    community.getUserComments.bind(community)
  );

  const rawComments = await getCommentsOnMyProfile(steamId);
  const comments = rawComments
    .map((comment) => ({
      steamId: steamId.toString(),
      authorId: comment.author.steamID.toString(),
      commentId: comment.id,
    }))
    .filter((c) => {
      if (filter === 'others') return c.authorId !== steamId;
      if (filter === 'mine') return c.authorId === steamId;
      return true;
    });

  if (comments.length === 0) {
    return { removed: 0, total: 0 };
  }

  onStart(comments.length);

  let current = 0;
  const removed = await removeChunk({
    comments,
    deleteComment,
    onItemRemoved: () => {
      current += 1;
      onProgress(current, comments.length);
    },
  });

  return { removed, total: comments.length };
}
