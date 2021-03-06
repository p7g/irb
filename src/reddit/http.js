const fetch = require('node-fetch');
const log = require('log').get('reddithttp');

const db = require('./db');
const limit = require('./limit');

const LIMIT = 100;
const REDDIT = 'https://reddit.com';
const SUBREDDIT = (r, before = '') => `\
${REDDIT}/r/${r}.json?limit=${LIMIT}&${before && `before=${before}`}`;

/**
 * Get the posts of a subreddit
 *
 * @param {string} subreddit The name of the subreddit
 * @param {string} [before] The last seen post ID
 * @return {Promise}
 */
function get(subreddit, before = '') {
  const url = SUBREDDIT(subreddit, before);
  log('Making request to: %s', url);
  return fetch(url)
    .then((res) => {
      if (res.ok) {
        return res.json();
      }
      log.error('Request to %s failed: %s', url, res.statusText);
      throw new Error(res.statusText);
    })
    .then(({ data }) => Object.assign(data, { subreddit }));
}

/**
 * Async generator, yielding the most recent posts for the subreddit that has
 * not been updated in the longest time
 *
 * @yields {Object} A reddit Listing object
 */
async function* refresh() {
  while (true) {
    /* eslint-disable no-await-in-loop, no-restricted-syntax  */
    const subreddits = await db.getSubreddits();
    for (const { _id, latestSeen } of subreddits) {
      try {
        yield await new Promise((resolve, reject) => {
          /* eslint-enable */
          limit.reddit(() => get(_id, latestSeen).then(resolve).catch(reject));
        });
      } catch (e) {
        log.error('Failed to get subreddit %s: %o', _id, e);
      }
    }
    if (subreddits.length === 0) {
      log('No subreddits found in database');
      // eslint-disable-next-line no-await-in-loop
      await new Promise(r => setTimeout(r, 10000));
    }
  }
}

/**
 * Check if a subreddit is valid (responds with success)
 *
 * @param {string} subreddit The name of the subreddit
 * @returns {Promise<boolean>} True if the subreddit exists
 */
async function isValidSubreddit(subreddit) {
  log('Validating subreddit %s', subreddit);
  try {
    const res = await fetch(`https://reddit.com/r/${subreddit}.json`);
    log('Subreddit status: %d', res.status);
    if (!res.ok) {
      return false;
    }
    const body = await res.json();
    if (body.kind === 'Listing') {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
}

module.exports = {
  get,
  isValidSubreddit,
  refresh,
  LIMIT,
};
