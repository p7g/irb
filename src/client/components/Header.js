import React from 'react';

import AccountMenu from './AccountMenu';

export default ({ user }) => (
  <header>
    <h1>inconspicuousRedditBot</h1>
    {user
      ? <AccountMenu user={user} />
      : (
        <a href="/api/v1/auth/discord">
          Log in with Discord
        </a>
      )
    }
    <hr />
  </header>
);
