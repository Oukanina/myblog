import Lockr from 'lockr';
import history from '../core/history';
import appState from '../core/state';

export default {

  name: 'logout',

  help: '',

  test: /^\s*logout\s*$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        const container = appState.get('containerElement');
        Lockr.set('token', null);
        history.push('/login');
        container.style.top = 0;
        appState.update('currentCommand', []);
        appState.update('login', false);
        appState.trigger('wheel');

        // if need goAhead then pass true
        resolve(false);
      } catch (err) {
        reject(true);
      }
    });
  },
};
