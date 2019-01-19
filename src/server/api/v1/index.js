const Router = require('koa-router');

const auth = require('./auth');
const confirmAuthentication = require('./confirmAuthentication');
const webhooks = require('./webhooks');
const users = require('./users');

const router = new Router();

router.use('/auth', auth.routes());
router.use('/webhooks', confirmAuthentication, webhooks.routes());
router.use('/users', confirmAuthentication, users.routes());

module.exports = router;
