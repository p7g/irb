/**
 * @typedef Subreddit
 * @property {string} name
 * @property {(string|null)} sort
 */

const regexes = {
  type: '(?:r/)?',
  name: '(?<name>[A-Za-z0-9]\\w{0,20})',
  sort: '(?:/(?<sort>top|new|hot|rising|controversial))?',
};

const subredditRegex = new RegExp(
  `^${regexes.type}${regexes.name}${regexes.sort}$`,
  'u',
);

/**
 * Break a subreddit into its type, name, and sort
 *
 * @param {string} subreddit The string representing the subreddit
 * @returns {Subreddit}
 */
function normalizeSubreddit(subreddit) {
  const match = subredditRegex.exec(subreddit);

  if (!match) {
    throw new Error(`Invalid subreddit '${subreddit}'`);
  }

  const {
    groups: {
      name,
      sort,
    },
  } = match;

  return {
    name: name.toLowerCase(),
    sort: sort || null,
  };
}

/**
 * Make a normalized subreddit back into a string
 *
 * @param {Object} subreddit
 * @param {string} subreddit.name
 * @param {(string|null)} subreddit.sort
 * @returns {string}
 */
function assembleSubreddit({ name, sort }) {
  if (sort) {
    return `${name}/${sort}`;
  }
  return name;
}

module.exports = {
  assembleSubreddit,
  normalizeSubreddit,
};
