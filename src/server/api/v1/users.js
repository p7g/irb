const Router = require('koa-router');
const db = require('../../db');
const discordDb = require('../../../discord/db');
const redditDb = require('../../../reddit/db');
const { success } = require('../../result');

const router = new Router();

router.get('/@me', async (ctx) => {
  const { userId } = ctx.session;
  const user = await db.getUser(userId);
  delete user.token;
  ctx.body = success(user);
});

router.get('/@me/webhooks', async (ctx) => {
  const { userId } = ctx.session;
  const { webhooks: webhookIds } = await db.getUser(userId);
  const webhooks = await Promise.all(
    (webhookIds || []).map(id => discordDb.getWebhook(id)),
  );
  await Promise.all(webhooks.map(async (webhook) => {
    // eslint-disable-next-line no-param-reassign
    webhook.subscriptions = await redditDb.getWebhookSubscriptions(webhook.id);
    delete webhook.token; // eslint-disable-line no-param-reassign
  }));
  ctx.body = success(webhooks);
});

module.exports = router;
