/* eslint-disable camelcase */
// ^ for working with discord json response objects

const log = require('log').get('discordhttp');
const fetch = require('node-fetch');
const Datastore = require('nedb');

log('Initializing queue');
const queue = new Datastore({
  filename: 'data/webhookQueue.db',
  autoload: true,
});

const db = require('./db');
const {
  makeQueryString,
  doFetch,
} = require('../utility');
const { makeEmbed } = require('./utility.js');

const EMBED_LIMIT = 100;
const SCOPE = 'identify';
const REDIRECT_URI = `${process.env.BASE_URL}/api/v1/auth/discord/callback`;
const AUTH_QUERY = {
  redirect_uri: REDIRECT_URI,
  scope: SCOPE,
  client_id: process.env.CLIENT_ID,
};

function getToken(code) {
  log('Getting token with code %s', code);
  const body = Object.assign({
    grant_type: 'authorization_code',
    client_secret: process.env.CLIENT_SECRET,
    code,
  }, AUTH_QUERY);

  return doFetch('https://discordapp.com/api/v6/oauth2/token', {
    method: 'POST',
    body: makeQueryString(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

function refreshAccessToken(refresh_token) {
  log('Refreshing access token with refresh token %s', refresh_token);
  const body = Object.assign({
    grant_type: 'refresh_token',
    client_secret: process.env.CLIENT_SECRET,
    refresh_token,
  });

  return doFetch('https://discordapp.com/api/v6/oauth2/token', {
    method: 'POST',
    body: makeQueryString(body),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
}

function getUserData({ token_type, access_token }) {
  log('Getting user data %s', token_type);
  return doFetch('https://discordapp.com/api/v6/users/@me', {
    headers: {
      authorization: `${token_type} ${access_token}`,
    },
  });
}

function getWebhook(url) {
  log('Getting webhook from %s', url);
  return doFetch(url);
}

async function executeWebhook({ id, token }, body) {
  const url = `https://discordapp.com/api/v6/webhooks/${id}/${token}`;
  log('Making request to webhook %s with body %s', url, body);
  const res = await fetch(url, {
    method: 'POST',
    body,
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return {
    remaining: res.headers.get('X-RateLimit-Remaining'),
    reset: res.headers.get('X-RateLimit-Reset'),
  };
}

function queueExecuteWebhook(webhook, body) {
  log('Queueing execute webhook %s', webhook.id);
  return new Promise((resolve, reject) => queue.insert(
    { webhookId: webhook.id, body, added: Date.now() },
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

async function sendPosts(webhookId, posts) {
  if (posts.length > EMBED_LIMIT) {
    throw new Error('Too many posts');
  }
  const webhook = await db.getWebhook(webhookId);
  const body = JSON.stringify({
    embeds: posts.map(({ data }) => makeEmbed(data)),
  });
  await queueExecuteWebhook(webhook, body);
}

function dequeue() {
  log('Dequeueing thing');
  return new Promise((resolve, reject) => queue.findOne({})
    .sort({ added: 1 })
    .exec((err, result) => (err ? reject(err) : resolve(result))));
}

function removeFromQueue(_id) {
  log('Deleting %s from queue', _id);
  return new Promise((resolve, reject) => queue.remove(
    { _id },
    {},
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

function countQueue() {
  return new Promise((resolve, reject) => queue.count(
    {},
    (err, result) => (err ? reject(err) : resolve(result)),
  ));
}

/* eslint-disable no-await-in-loop */
async function startQueue() {
  log('Monitoring queue');
  for (;;) {
    if (await countQueue() === 0) {
      await new Promise(res => setTimeout(res, 1000));
      continue; // eslint-disable-line no-continue
    }
    log('Handling queued message');
    // get one from queue
    const { _id, webhookId, body } = await dequeue();
    // get webhook
    const {
      remaining,
      reset,
      token,
    } = await db.getWebhook(webhookId);
    // if remaining or reset < Date.now()
    //  execute, update limits, and remove
    if (remaining === undefined || remaining > 0 || reset < Date.now()) {
      log('Webhook %s has %d remaining messages', webhookId, remaining);
      const newLimits = await executeWebhook({ id: webhookId, token }, body);
      log('Got new limits for webhook %s: %o', webhookId, newLimits);
      await Promise.all([
        db.updateWebhook(webhookId, {
          $set: {
            remaining: newLimits.remaining,
            reset: newLimits.reset,
          },
        }),
        removeFromQueue(_id),
      ]);
    }
  }
}
/* eslint-enable */

module.exports = {
  AUTH_QUERY,
  EMBED_LIMIT,
  getToken,
  getUserData,
  getWebhook,
  refreshAccessToken,
  sendPosts,
  startQueue,
};
