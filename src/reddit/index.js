const log = require('log').get('reddit');
const snooper = require('reddit-snooper');

const db = require('./db');
const discord = require('../discord/http');

module.exports = class Listener {
  constructor() {
    this.handlers = new Map();
    this.watchers = new Map();

    this.registerSubreddit = this.registerSubreddit.bind(this);
    this.unregisterSubreddit = this.unregisterSubreddit.bind(this);
  }

  static getErrorHandler(name) {
    return function errorHandler(error) {
      log(`Error watching subreddit ${name}: ${error.toString()}`);
    };
  }

  static getPostHandler(name) {
    return async function postHandler(post) {
      log(`New post on subreddit ${name}`);
      const { subscriptions } = await db.getSubreddit(name);

      subscriptions.forEach((webhook) => {
        discord.sendPosts(webhook, [post]);
      });
    };
  }

  registerSubreddit(name) {
    const watcher = snooper.watcher.getPostWatcher(name);
    const handler = Listener.getPostHandler(name);

    watcher
      .on('post', handler)
      .on('error', Listener.getErrorHandler(name));

    this.watchers.set(name, watcher);
    this.handlers.set(name, handler);
  }

  unregisterSubreddit(name) {
    const watcher = this.watchers.get(name);
    const handler = this.handlers.get(name);

    // FIXME: What if one or both is null?

    watcher.off(name, handler);
  }

  async start() {
    const subreddits = await db.getSubreddits();

    subreddits.forEach(this.registerSubreddit);
  }

  stop() {
    const subreddits = this.watchers.keys();

    subreddits.forEach(this.unregisterSubreddit);
  }
};
