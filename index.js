require('dotenv').config();
require('log-node')();

const serve = require('./src/server');
const watchReddit = require('./src/reddit');
const { startQueue } = require('./src/discord/http');

serve(8080);
watchReddit();
startQueue();
