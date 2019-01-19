const { RateLimiter } = require('limiter');

const reddit = new RateLimiter(30, 'minute');

function limit(limiter, fn) {
  return limiter.removeTokens(1, fn);
}

module.exports = {
  reddit: limit.bind(undefined, reddit),
};
