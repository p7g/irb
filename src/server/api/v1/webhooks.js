const Router = require('koa-router');
const log = require('log').get('webhooks');

const userDb = require('../../db');
const db = require('../../../reddit/db');
const http = require('../../../reddit/http');
const discordDb = require('../../../discord/db');
const discordHttp = require('../../../discord/http');
const { Errors } = require('../../../common/errors');
const { error, success } = require('../../result');

const router = new Router();

router.post('/', async (ctx) => {
  if (!ctx.request.body.url) {
    ctx.status = 400;
    ctx.body = error(Errors.BAD_REQUEST);
    return;
  }

  let webhook;
  try {
    webhook = await discordHttp.getWebhook(ctx.request.body.url);
  } catch (e) {
    ctx.status = 400;
    ctx.body = error(Errors.INVALID_WEBHOOK_URL);
    return;
  }

  try {
    await discordDb.addWebhook(webhook);
  } catch (e) {
    ctx.status = 400;
    ctx.body = error(Errors.DUPLICATE_WEBHOOK);
    return;
  }

  await userDb.updateUser(
    ctx.session.userId,
    { $addToSet: { webhooks: webhook.id } },
  );

  delete webhook.token;
  webhook.subscriptions = await db.getWebhookSubscriptions(webhook.id);
  ctx.body = success(webhook);
});

router.delete('/:id', async (ctx) => {
  const owner = await userDb.getWebhookOwner(ctx.params.id);
  // eslint-disable-next-line no-underscore-dangle
  if (owner._id !== ctx.session.userId) {
    log(
      'user %s is not owner of webhook %s (%s)',
      ctx.session.userId,
      ctx.params.id,
      owner._id, // eslint-disable-line no-underscore-dangle
    );
    ctx.status = 401;
    ctx.body = error(Errors.UNAUTHORIZED);
    return;
  }

  await Promise.all([
    userDb.updateUser(ctx.session.userId, {
      $pull: { webhooks: ctx.params.id },
    }),
    discordDb.removeWebhook(ctx.params.id),
    db.unsubscribeFromAll(ctx.params.id),
  ]);
  ctx.status = 200;
  ctx.body = success();
});

/**
 * Add a new subscription
 */
router.post('/:id/subscriptions', async (ctx) => {
  const owner = await userDb.getWebhookOwner(ctx.params.id);
  // eslint-disable-next-line no-underscore-dangle
  if (owner._id !== ctx.session.userId) {
    log(
      'user %s is not owner of webhook %s (%s)',
      ctx.session.userId,
      ctx.params.id,
      owner._id, // eslint-disable-line no-underscore-dangle
    );
    ctx.status = 401;
    ctx.body = error(Errors.UNAUTHORIZED);
    return;
  }

  if (!ctx.request.body.subreddit) {
    ctx.status = 400;
    ctx.body = error(Errors.BAD_REQUEST);
    return;
  }
  const { subreddit } = ctx.request.body;
  const subObj = await db.getSubreddit(subreddit);
  // eslint-disable-next-line no-underscore-dangle
  const subredditExists = subObj && subObj._id;
  if (!subredditExists) {
    if (!await http.isValidSubreddit(subreddit)) {
      ctx.status = 400;
      ctx.body = error(Errors.INVALID_SUBREDDIT);
      return;
    }
    await db.registerSubreddit(subreddit);
    ctx.redditListener.registerSubreddit(subreddit);
  }
  await db.subscribe(ctx.params.id, subreddit);
  ctx.body = success(await db.getSubreddit(subreddit));
});

/**
 * Remove a subscription
 */
router.delete('/:id/subscriptions/:subreddit', async (ctx) => {
  const owner = await userDb.getWebhookOwner(ctx.params.id);
  // eslint-disable-next-line no-underscore-dangle
  if (owner._id !== ctx.session.userId) {
    log(
      'user %s is not owner of webhook %s (%s)',
      ctx.session.userId,
      ctx.params.id,
      owner._id, // eslint-disable-line no-underscore-dangle
    );
    ctx.status = 401;
    ctx.body = error(Errors.UNAUTHORIZED);
    return;
  }

  const { subreddit } = ctx.params;
  await db.unsubscribe(ctx.params.id, subreddit);
  if (await db.subscriptionCount(subreddit) === 0) {
    await db.deleteSubreddit(subreddit);
    ctx.redditListener.unregisterSubreddit(subreddit);
  }
  ctx.status = 200;
  ctx.body = success();
});

module.exports = router;
