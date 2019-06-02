const { join } = require('path');

const Koa = require('koa');
const body = require('koa-body');
const compress = require('koa-compress');
const helmet = require('koa-helmet');
const logger = require('koa-logger');
const Router = require('koa-router');
const send = require('koa-send');
const serve = require('koa-static');
const session = require('koa-session');

const log = require('log').get('server');
const Sentry = require('@sentry/node');

const api = require('./api');

const app = new Koa();
const router = new Router();

app.keys = [process.env.CLIENT_SECRET];

router.use('/api', body(), api.routes());
router.all('*', async (ctx) => {
  await send(ctx, 'public/index.html');
});

app.on('error', (err, ctx) => {
  Sentry.captureEvent({
    exception: err,
    contexts: ctx,
  });
});

module.exports = (port, listener) => {
  log.debug('Adding middleware');
  app
    .use(logger())
    .use(compress())
    .use(helmet())
    .use(serve(join(__dirname, '../../public')))
    .use((ctx) => { ctx.redditListener = listener; })
    .use(session(app))
    .use(router.routes())
    .use(router.allowedMethods())
    .listen(port);
  log.debug('Listening on port %d', port);
};
