import Lockr from 'lockr';
import history from '../core/history';
import appState from '../core/state';

export default {

  name: 'logout',

  test: /^\s*logout\s*$/,

  action() {
    return new Promise((resolve) => {
      Lockr.set('token', null);
      history.push('/login');
      const container = appState.get('containerElement');
      container.style.top = 0;
      appState.update('login', false);
      appState.trigger('wheel');

      // if need goAhead then pass true
      resolve(true);
    });
  },
};
