import appState from '../core/state';
import { myCommands, addCurrentCommandToHistory, clearCurrentCommand } from './index';

export default {

  name: 'help',

  help: '',

  test: /^\s*help\s*$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        addCurrentCommandToHistory(true);
        const historyCommands = appState.get('historyCommands');
        for (let i = 0; i < myCommands.length; i += 1) {
          historyCommands.push({
            text: `  ${myCommands[i].name} --${myCommands[i].help || ''}`,
          });
        }
        appState.trigger('historyCommands');
        clearCurrentCommand();
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  },

};
