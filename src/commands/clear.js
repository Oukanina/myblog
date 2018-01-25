import appState from '../core/state';

export default {

  name: 'clear',

  help: '',

  test: /^\s*clear\s*$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        appState.update('historyCommands', []);
        appState.update('showLoginInfo', false);

        setTimeout(() => {
          appState.update('currentCommand', []);
        }, 0);

        // if need create a new line then pass true
        resolve(false);
      } catch (err) {
        reject(true);
      }
    });
  },
};
