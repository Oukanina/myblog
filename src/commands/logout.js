import Lockr from 'lockr';
import history from '../core/history';
import appState from '../core/state';
import { addCurrentCommandToHistory } from './index';

export default {

  name: 'logout',

  help: 'Logout',

  test: /^\s*logout|exit\s*$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        const container = appState.get('containerElement');
        container.style.top = 0;

        addCurrentCommandToHistory(true);

        Lockr.set('token', null);
        appState.trigger('wheel');

        setTimeout(() => {
          appState.update('currentCommand', []);
        }, 0);
        setTimeout(() => {
          appState.update('login', false);
          history.push('/login');
        }, 50);
        // if need goAhead then pass true
        resolve(false);
      } catch (err) {
        reject(true);
      }
    });
  },
};
