import appState from '../core/state';

export default {

  name: 'clear',

  help: '',

  test: /^\s*clear\s*$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        appState.update('historyCommands', []);
        appState.update('currentCommand', []);
        appState.update('showLoginInfo', false);

        // if need create a new line then pass true
        resolve(false);
      } catch (err) {
        reject(true);
      }
    });
  },
};
