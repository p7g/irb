const Router = require('koa-router');
const log = require('log').get('auth');
const {
  makeQueryString,
  encodeState,
  decodeState,
} = require('../../../utility');
const {
  AUTH_QUERY,
  getToken,
  getUserData,
} = require('../../../discord/http');
const db = require('../../db');

const router = new Router();

router.get('/discord', (ctx) => {
  const queryObj = Object.assign({
    response_type: 'code',
    state: encodeState({
      success: ctx.query.success,
      fail: ctx.query.fail,
    }),
  }, AUTH_QUERY);
  const qs = makeQueryString(queryObj);
  ctx.redirect(`https://discordapp.com/api/v6/oauth2/authorize?${qs}`);
});

router.get('/discord/callback', async (ctx) => {
  try {
    const token = await getToken(ctx.query.code);
    const userData = await getUserData(token);
    token.expires_at = new Date(Date.now() + token.expires_in * 1000);

    const user = Object.assign({ token }, userData);

    const dbUser = await db.getUser(user.id);
    if (!dbUser || !dbUser._id) { // eslint-disable-line no-underscore-dangle
      await db.addUser(user);
    } else {
      await db.updateUser(user.id, user);
    }

    ctx.session.userId = user.id;

    ctx.redirect(
      ctx.params.state ? decodeState(ctx.params.state).success : '/',
    );
  } catch (e) {
    log('%o', e);
    ctx.redirect(ctx.params.state ? decodeState(ctx.params.state).fail : '/');
  }
});

router.get('/discord/logout', async (ctx) => {
  await db.removeToken(ctx.session.userId);
  ctx.session.userId = undefined;
  ctx.status = 200;
});

module.exports = router;
