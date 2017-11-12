import appState from '../core/state';
// import fetch from '../core/fetch';
import api from '../core/api';
import { addCurrentCommandToHistory } from './index';


export default {

  name: 'ls',

  help: '',

  test: /^\s*ls\s*$/,

  action() {
    return new Promise(async (resolve, reject) => {
      try {
        const home = appState.get('HOME');
        const res = await api(`/graphql?query={
          ls(path:"${home}") {
            children {
              id
              name
              type
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
            historyCommands.push({
              inline: 4,
              text: file.name,
              style: file.type === 'd' ? {
                color: 'green',
              } : { },
            });
          });
          appState.update('historyCommands', historyCommands);
        }

        // if need create a new line then pass true
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  },
};
