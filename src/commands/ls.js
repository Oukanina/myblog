import appState from '../core/state';
import fetch from '../core/fetch';
import { addCurrentCommandToHistory } from './index';


export default {

  name: 'ls',

  help: '',

  test: /^\s*ls\s*$/,

  action() {
    return new Promise(async (resolve, reject) => {
      try {
        const home = appState.get('HOME');
        const res = await fetch(`/graphql?query={
          ls(path:"${home}") {
            children {
              id
              name
            }
          }
        }`).catch((err) => { throw err; });
        const json = await res.json();
        const files = json.data.ls.children;
        const historyCommands = appState.get('historyCommands');
        addCurrentCommandToHistory(true);
        appState.update('currentCommand', []);
        if (files.length) {
          files.forEach((file) => {
            historyCommands.push({ text: file.name });
          });
          appState.update('historyCommands', historyCommands);
        }

        // if need create a new line then pass true
        resolve(false);
      } catch (err) {
        reject(true);
      }
    });
  },
};
