require('dotenv').config();
require('log-node')();
require('./src/log')();

const log = require('log').get('main');
const serve = require('./src/server');
const Listener = require('./src/reddit');
const { startQueue } = require('./src/discord/http');

const listener = new Listener();

(async () => {
  await listener.start();
  serve(8080, listener);
  await startQueue();
})()
  .catch(e => log(`Error in root function: ${e.toString()}`));
