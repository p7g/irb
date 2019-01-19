import React from 'react';

import Webhooks from '../components/Webhooks';

export default ({ loggedIn }) => (
  <React.Fragment>
    {loggedIn || (
      <p>Log in with Discord to subscribe channels to subreddits</p>
    )}
    {loggedIn && (
      <Webhooks />
    )}
  </React.Fragment>
);
