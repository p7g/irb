const log = require('log').get('reddit');

const db = require('./db');
const http = require('./http');
const discord = require('../discord/http');

module.exports = async function start() {
  log('Started');
  // eslint-disable-next-line no-restricted-syntax
  for await (const data of http.refresh()) {
    // TODO: record seen sticky and pinned posts, don't filter out new ones
    const posts = data.children.filter(
      ({ data: { stickied, pinned } }) => !stickied && !pinned,
    );
    if (posts.length === 0) {
      // if there are no posts in the response, there is nothing new
      continue; // eslint-disable-line no-continue
    }

    log('New posts in subreddit %s', data.subreddit);
    const latest = posts[0];
    const latestId = `${latest.kind}_${latest.data.id}`;

    const chunks = [];
    do {
      // The new posts don't fit on one page
      chunks.push(posts.splice(0, discord.EMBED_LIMIT));
    } while (posts.length > discord.EMBED_LIMIT);

    const { subscriptions } = await db.getSubreddit(data.subreddit);
    await Promise.all(chunks.map(chunk => Promise.all(
      subscriptions.map(webhook => discord.sendPosts(webhook, chunk)),
    )));

    // record most recent id as latestSeen in subreddit
    await db.updateSubreddit(data.subreddit, { latestSeen: latestId });
  }
};
