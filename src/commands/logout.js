import Lockr from 'lockr';
import history from '../core/history';
import appState from '../core/state';

export default {
  test: /^\s*logout\s*$/,

  action() {
    return new Promise((resolve) => {
      Lockr.set('token', '');
      appState.update('login', false);
      history.push('/login');
      // if need goAhead then pass true
      resolve(false);
    });
  },
};
