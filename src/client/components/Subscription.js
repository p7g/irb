import React from 'react';

export default ({ subreddit, unsubscribe, webhookId }) => (
  <li>
    <p>
      <strong>{subreddit}</strong>
      {' '}
      <button
        type="button"
        onClick={() => unsubscribe(webhookId, subreddit)}
      >
        Unsubscribe
      </button>
    </p>
  </li>
);
