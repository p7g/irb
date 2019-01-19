const Datastore = require('nedb');
const log = require('log').get('discorddb');

log('Initializing webhook database');
const webhooks = new Datastore({
  filename: 'data/webhooks.db',
  autoload: true,
});

function addWebhook(webhook) {
  log('Adding new webhook %s', webhook.id);
  return new Promise((resolve, reject) => webhooks.insert(
    Object.assign(webhook, { _id: webhook.id }),
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

function removeWebhook(_id) {
  log('Removing webhook %s', _id);
  return new Promise((resolve, reject) => webhooks.remove(
    { _id },
    {},
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

function updateWebhook(_id, props) {
  log('Updating webhook %s', _id);
  return new Promise((resolve, reject) => webhooks.update(
    { _id },
    props,
    {},
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

/**
 * Get a webhook document from the DB
 *
 * @param {string} webhookId The webhook's ID
 * @returns {Promise}
 */
function getWebhook(webhookId) {
  log('Getting webhook %s', webhookId);
  return new Promise((resolve, reject) => webhooks.findOne(
    { _id: webhookId },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

module.exports = {
  addWebhook,
  getWebhook,
  removeWebhook,
  updateWebhook,
};
