const MAX_TITLE_LENGTH = 256;
const MAX_DESCRIPTION_LENGTH = 2048;
const MAX_FOOTER_TEXT_LENGTH = 2048;

function truncate(str, len) {
  if (str.length > len) {
    return `${str.substr(0, len - 3)}...`;
  }
  return str;
}

/**
 * Generate an embed for a reddit post
 *
 * @param {Object} post A reddit post object from the API
 * @returns {Object} A discord embed object
 */
function makeEmbed(post) {
  let totalChars = 0;

  const title = truncate(post.title, MAX_TITLE_LENGTH);
  const url = `https://reddit.com${post.permalink}`;
  const timestamp = (new Date(post.created * 1000)).toISOString();
  const footer = {
    text: truncate(post.subreddit_name_prefixed, MAX_FOOTER_TEXT_LENGTH),
  };

  const embed = {
    title,
    url,
    timestamp,
    footer,
  };

  if (post.selftext) {
    embed.description = truncate(post.selftext, MAX_DESCRIPTION_LENGTH);
    totalChars += embed.description.length;
  }
  if (
    post.thumbnail
    && post.post_hint !== 'image'
    && !['self', 'default'].includes(post.thumbnail)
  ) {
    embed.thumbnail = {
      url: post.thumbnail,
    };
  }
  if (post.post_hint === 'image') {
    embed.image = {
      url: post.url,
    };
  }

  totalChars += title.length + footer.text.length;

  if (totalChars > 6000) {
    throw new Error('big embed');
  }
  return embed;
}

module.exports = {
  makeEmbed,
};
