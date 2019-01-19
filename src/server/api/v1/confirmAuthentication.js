const log = require('log').get('checkauth');
const { refreshAccessToken } = require('../../../discord/http');
const { error } = require('../../result');
const { Errors } = require('../../../common/errors');

const db = require('../../db');

module.exports = async function confirmAuthentication(ctx, next) {
  const { userId } = ctx.session;
  if (!userId) {
    log('no userId found in session');
    ctx.body = error(Errors.UNAUTHORIZED);
    return;
  }

  const user = await db.getUser(userId);
  if (!user || !user.token) {
    ctx.body = error(Errors.UNAUTHORIZED);
    return;
  }

  if (Date.now() > user.expires_at) {
    try {
      const token = await refreshAccessToken(user.token.refresh_token);
      db.updateUser(userId, { $set: { token } });
    } catch (e) {
      ctx.body = error(Errors.UNAUTHORIZED);
      return;
    }
  }

  log(
    'Successfully authenticated user %s#%s',
    user.username,
    user.discriminator,
  );
  await next();
};
