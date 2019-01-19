const { URLSearchParams } = require('url');
const R = require('ramda');
const log = require('log').get('utility');
const fetch = require('node-fetch');

const makeQueryString = obj => Object.entries(obj)
  // eslint-disable-next-line no-sequences
  .reduce((fd, pair) => (fd.append(...pair), fd), new URLSearchParams());

const base64Encode = data => Buffer.from(data).toString('base64');
const base64Decode = data => Buffer.from(data, 'base64').toString();

const encodeState = R.compose(
  encodeURIComponent,
  base64Encode,
  JSON.stringify,
);
const decodeState = R.compose(JSON.parse, base64Decode);

async function doFetch(...params) {
  log('Fetching %s with options %o', params[0], params[1] || null);
  const res = await fetch(...params);

  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const json = res.json();

  if (json.error) {
    throw new Error(json.error);
  }
  return json;
}

module.exports = {
  makeQueryString,
  base64Encode,
  base64Decode,
  encodeState,
  decodeState,
  doFetch,
};
