import React from 'react';

export default ({
  user: {
    username,
    discriminator,
    avatar,
    id,
  },
}) => (
  <div>
    <img
      src={`https://cdn.discordapp.com/avatars/${id}/${avatar}.jpg?size=32`}
      alt={`${username}'s avatar`}
    />
    <p>
      <large>
        {username}
      </large>
      <small>
        #
        {discriminator}
      </small>
    </p>
  </div>
);
