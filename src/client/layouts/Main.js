import React from 'react';

import Header from '../components/Header';

export default ({ user, children }) => (
  <main>
    <Header user={user} />
    {children}
  </main>
);
