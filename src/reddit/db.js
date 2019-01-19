const Datastore = require('nedb');
const log = require('log').get('redditdb');

log('Initializing subreddit database');
const subreddits = new Datastore({
  filename: 'data/subreddits.db',
  autoload: true,
});

/**
 * Subscribe a webhook to a subreddit
 *
 * @param {string} webhookId The ID of the webhook
 * @param {string} subreddit The name of the subreddit
 * @returns {Promise}
 */
function subscribe(webhookId, subreddit) {
  log('Subscribing webhook %s to subreddit %s', webhookId, subreddit);
  return new Promise(resolve => subreddits.update(
    { _id: subreddit.toLowerCase() },
    { $addToSet: { subscriptions: webhookId } },
    {},
    resolve,
  ));
}

/**
 * Unsubscribe a webhook from a subreddit
 *
 * @param {string} webhookId The ID of the webhook
 * @param {string} subreddit The name of the subreddit
 * @returns {Promise}
 */
function unsubscribe(webhookId, subreddit) {
  log('Unsubcribing webhook %s from subreddit %s', webhookId, subreddit);
  return new Promise(resolve => subreddits.update(
    { _id: subreddit.toLowerCase() },
    { $pull: { subscriptions: webhookId } },
    {},
    resolve,
  ));
}

function unsubscribeFromAll(webhookId) {
  log('Unsubscribing webhook %s from all', webhookId);
  return Promise.all([
    new Promise((resolve, reject) => subreddits.update(
      { subscriptions: { $elemMatch: webhookId } },
      { $pull: { subscriptions: webhookId } },
      { multi: true },
      (err, result) => (err ? reject(err) : resolve(result)),
    )),
    new Promise((resolve, reject) => subreddits.remove(
      { subscriptions: { $size: 0 } },
      { multi: true },
      (err, result) => (err ? reject(err) : resolve(result)),
    )),
  ]);
}

/**
 * Add a subreddit record
 *
 * @param {string} subreddit The name of the subreddit
 */
function registerSubreddit(subreddit) {
  log('Registering new subreddit %s');
  return new Promise((resolve, reject) => subreddits.insert(
    {
      _id: subreddit.toLowerCase(),
      latestSeen: null,
      lastUpdate: null,
      subscriptions: [],
    },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

/**
 * Get all subreddits
 *
 * @returns {Promise}
 */
function getSubreddits() {
  log('Getting all subreddits');
  return new Promise(
    (resolve, reject) => subreddits.find({})
      .sort({ lastUpdate: 1 })
      .exec((err, result) => (err ? reject(err) : resolve(result))),
  );
}

/**
 * Get a specific subreddit
 *
 * @param {string} _id The name of the subreddit
 * @returns {Promise}
 */
function getSubreddit(_id) {
  log('Getting subreddit %s', _id.toLowerCase());
  return new Promise((resolve, reject) => subreddits.findOne(
    { _id: _id.toLowerCase() },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

function getWebhookSubscriptions(webhookId) {
  log('Getting subscriptions for webhook %s', webhookId);
  return new Promise((resolve, reject) => subreddits.find(
    { subscriptions: { $elemMatch: webhookId } },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

function deleteSubreddit(_id) {
  log('Deleting subreddit %s', _id);
  return new Promise((resolve, reject) => subreddits.remove(
    { _id: _id.toLowerCase() },
    {},
    (err, numRemoved) => (err ? reject(err) : resolve(numRemoved)),
  ));
}

/**
 * Check to see if a subreddit has no webhooks subscribed, and remove
 *
 * @param {string} subreddit The name of the subreddit
 * @returns {Promise}
 */
async function removeIfNoSubscriptions(subreddit) {
  log('Removing subreddit %s if no subscriptions', subreddit);
  const subObj = await getSubreddit(subreddit);
  if (subObj.subscriptions && subObj.subscriptions.length === 0) {
    return deleteSubreddit(subreddit);
  }
  return Promise.resolve();
}

/**
 * Update a subreddit document
 *
 * @param {string} _id The name of the subreddit
 * @param {object} props The updates to apply
 * @returns {Promise}
 */
function updateSubreddit(_id, props) {
  log('Updating subreddit %s with %O', _id.toLowerCase(), props);
  return new Promise(resolve => subreddits.update(
    { _id: _id.toLowerCase() },
    { $set: Object.assign({ lastUpdate: Date.now() }, props) },
    {},
    resolve,
  ));
}

module.exports = {
  getSubreddit,
  getSubreddits,
  getWebhookSubscriptions,
  registerSubreddit,
  removeIfNoSubscriptions,
  subscribe,
  unsubscribe,
  unsubscribeFromAll,
  updateSubreddit,
};
