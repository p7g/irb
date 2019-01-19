const Errors = {
  NOT_FOUND: 1,
  UNAUTHORIZED: 2,
  BAD_REQUEST: 3,
  INVALID_WEBHOOK_URL: 4,
  DUPLICATE_WEBHOOK: 5,
  INVALID_SUBREDDIT: 6,
};

const ErrorMessages = {
  [Errors.NOT_FOUND]: 'Resource not found',
  [Errors.UNAUTHORIZED]: 'Must log in',
  [Errors.BAD_REQUEST]: 'Bad request',
  [Errors.INVALID_WEBHOOK_URL]: 'Invalid webhook URL',
  [Errors.DUPLICATE_WEBHOOK]: 'Webhook URL already in use',
  [Errors.INVALID_SUBREDDIT]: 'Subreddit does not exist',
};

module.exports = {
  ErrorMessages,
  Errors,
};
