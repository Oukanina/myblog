import compress from 'graphql-query-compress';
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
  return new Promise((resolve, reject) => {
    const authToken = Lockr.get('token');
    if (checkToken && !authToken) {
      Lockr.set('token', '');
      history.replace('/login');
      appState.update('login', false);
      throw ERR_NO_TOKEN;
    }

    const headers = Object.assign({}, defaultOptions.headers, options.headers, {
      Authorization: `Bearer ${authToken}`,
    });

    fetch(compress(url), Object.assign({}, defaultOptions, options, {
      headers,
    })).then((res) => {
      switch (res.status) {
        case 201:
        case 200:
          return resolve(res);
        case 401:
          appState.update('login', false);
          Lockr.set('token', '');
          history.replace('/login');
          break;
        case 404:
        case 500:
          history.push('/500');
          break;
        default:
          break;
      }
      return resolve(res);
    }).catch((err) => {
      reject({ errors: [err.message] });
    });
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
