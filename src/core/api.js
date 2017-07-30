import Lockr from 'lockr';
import fetch from './fetch';
import history from './history';
import appState from './state';

const defaultOptions = {
  method: 'post',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
};

export const ERR_400 = new Error('400');
export const ERR_401 = new Error('401');
export const ERR_404 = new Error('404');
export const ERR_500 = new Error('500');
export const ERR_NO_TOKEN = new Error('no token!');

function api(url, options = {}, checkToken = true) {
  return new Promise(async (resolve, reject) => {
    try {
      const authToken = Lockr.get('token');
      if (checkToken && !authToken) {
        history.replace('/login');
        appState.update('login', false);
        throw ERR_NO_TOKEN;
      }

      const headers = Object.assign({}, defaultOptions.headers, options.headers, {
        Authorization: `Bearer ${authToken}`,
      });
      const res = await fetch(url, Object.assign({}, defaultOptions, options, {
        headers,
      }));

      switch (res.status) {
        case 201:
        case 200:
          resolve(res);
          break;
        case 400:
          throw ERR_400;
        case 401:
          history.replace('/login');
          appState.update('login', false);
          throw ERR_401;
        case 404:
          throw ERR_404;
        case 500:
          history.replace('/500');
          throw ERR_500;
        default:
          break;
      }
    } catch (err) {
      reject(err);
    }
  });
}

function me() { return api('/me', { method: 'get' }); }
function isToken() { return api('/istoken', { method: 'get' }); }
function token({ username, password }) {
  return api('/token', {
    ...defaultOptions,
    body: JSON.stringify({
      username, password,
    }),
  }, false);
}
function apiVerificationUsername(username) {
  return api('/verificationUsername', {
    ...defaultOptions,
    body: JSON.stringify({
      username,
    }),
  }, false);
}

export default api;
export {
  me, token, isToken, apiVerificationUsername,
};
