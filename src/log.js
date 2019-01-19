const Sentry = require('@sentry/node');
const emitter = require('log/writer-utils/emitter');

Sentry.init({
  dsn: process.env.SENTRY_DSN,
});

const WARNING_INDEX = 3;

module.exports = function init() {
  emitter.on('log', (e) => {
    if (!e.logger.isEnabled) {
      return;
    }
    if (e.logger.levelIndex < WARNING_INDEX) {
      return;
    }

    const [message, ...contexts] = e.messageTokens;
    Sentry.captureEvent({
      message,
      contexts,
      severity: Sentry.Severity.fromString(e.logger.level),
    });
  });
};
