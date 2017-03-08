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

function api(url, options = {}, checkToken = true) {
  const authToken = Lockr.get('token');
  if (checkToken && !authToken) {
    history.push('/login');
    appState.update('login', false);
    throw new Error(`no token ${url}`);
  }
  const headers = Object.assign({}, defaultOptions.headers, options.headers, {
    Authorization: `Bearer ${authToken}`,
  });

  return fetch(url, Object.assign({}, defaultOptions, options, {
    headers,
  }))
  .then((res) => {
    switch (res.status) {
      case 400:
        // history.push('/login');
        throw new Error('400');
      case 401:
        history.push('/login');
        appState.update('login', false);
        throw new Error('401');
      case 404:
        // history.push('/404');
        throw new Error('404');
      case 500:
        history.push('/500');
        throw new Error('500');
      default:
        break;
    }

    return res;
  });
}

function me() { return api('/me', { method: 'get' }); }
function token(options) { return api('/token', options, false); }
function isToken() { return api('/istoken', { method: 'get' }); }

export default api;
export {
  me, token, isToken,
};
