const DataStore = require('nedb');
const log = require('log').get('userdb');

log('Initializing users db');
const users = new DataStore({
  filename: 'data/users.db',
  autoload: true,
});

/**
 * Update a users token, inserting the user if they do not yet exist
 *
 * @param {string} _id The user's snowflake ID
 * @param {Object} props The user's current access token
 * @returns {Promise}
 */
function updateUser(_id, props) {
  log('Updating user %s with props %o', _id, props);
  return new Promise((resolve, reject) => users.update(
    { _id },
    props,
    {},
    (err, num) => (err ? reject(err) : resolve(num)),
  ));
}

function addUser(user) {
  log('Adding user %s', user.id);
  return new Promise((resolve, reject) => users.insert(
    Object.assign(user, { webhooks: [], _id: user.id }),
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

function addWebhookToUser(_id, webhook) {
  log('Adding webhook %s to user %s', webhook, _id);
  return new Promise((resolve, reject) => users.update(
    { _id },
    { $addToSet: { webhooks: webhook } },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

/**
 * Get a user from the database by ID
 *
 * @param {string} _id The user's ID
 * @returns {Promise}
 */
function getUser(_id) {
  log('Getting user %s', _id);
  return new Promise((resolve, reject) => users.findOne(
    { _id },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

/**
 * Remove the token from a user in the database
 *
 * @param {string} _id The user's ID
 */
function removeToken(_id) {
  log('Removing token from user %s', _id);
  return new Promise((resolve, reject) => users.update(
    { _id },
    { $set: { token: null } },
    {},
    (err, num) => (err ? reject(err) : resolve(num)),
  ));
}

function getWebhookOwner(webhookId) {
  log('Getting owner of webhook %s', webhookId);
  return new Promise((resolve, reject) => users.findOne(
    { webhooks: { $elemMatch: webhookId } },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

module.exports = {
  addUser,
  addWebhookToUser,
  getUser,
  getWebhookOwner,
  removeToken,
  updateUser,
};
