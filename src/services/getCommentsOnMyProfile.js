import { getCommentsGenerator } from './getComments.js';

export default async function* getCommentsOnMyProfile(
  community,
  filter,
  mySteamId
) {
  for await (const { page, comments } of getCommentsGenerator(
    community,
    mySteamId
  )) {
    const filtered = comments
      .map((comment) => ({
        profileId: mySteamId,
        authorId: comment.author.steamID.toString(),
        commentId: comment.id,
      }))
      .filter((c) => {
        if (filter === 'others') return c.authorId !== mySteamId;
        if (filter === 'mine') return c.authorId === mySteamId;
        return true;
      });

    if (filtered.length > 0) {
      yield { page, comments: filtered };
    }
  }
}
