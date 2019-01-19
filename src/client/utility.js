import { Errors, ErrorMessages } from '../common/errors';

// comma operator, but in a function
export const comma = (...exprs) => exprs.pop();

export function validateResponse(res) {
  if (res.ok) {
    return res.json();
  }
  throw new Error(res.statusText);
}

export async function loginIfNotAuthenticated(res) {
  const { ok } = res;
  const json = await res.json();
  if (!ok) {
    const { code } = json;
    if (code === Errors.UNAUTHORIZED) {
      // eslint-disable-next-line no-restricted-globals, no-undef
      window.location.replace('/api/v1/auth/discord');
    }
  }
  return json;
}

export function getErrorMessage({ code }) {
  if (code !== undefined) {
    return ErrorMessages[code];
  }
  return '';
}

export const random = () => Math.floor(Math.random() * 100000);
