import appState from '../core/state';
import {
  myCommands,
  addCurrentCommandToHistory,
  clearCurrentCommand,
} from './index';

export default {

  name: 'help',

  help: 'Just this...',

  test: /^\s*help.*$/,

  action() {
    return new Promise((resolve, reject) => {
      try {
        addCurrentCommandToHistory(true);
        const historyCommands = appState.get('historyCommands');

        for (let i = 0; i < myCommands.length; i += 1) {
          const commandName = myCommands[i].name;

          historyCommands.push({
            text: `  ${commandName}:`,
          });
          historyCommands.push({
            text: `    ${myCommands[i].help || ''}`,
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
