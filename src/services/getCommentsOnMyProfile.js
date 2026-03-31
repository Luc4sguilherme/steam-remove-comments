import util from 'util';

async function* getCommentsOnMyProfile(community, steamId) {
  let page = 1;

  do {
    const getUserComments = util.promisify(
      community.getUserComments.bind(community)
    );

    const comments = await getUserComments(steamId, {
      start: 0,
      count: 50,
    });

    if (comments.length === 0) break;

    yield { page, comments };

    page += 1;
  } while (true);
}

export default getCommentsOnMyProfile;
