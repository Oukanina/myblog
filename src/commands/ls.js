import _path from 'path';
import appState from '../core/state';
import api from '../core/api';
import { addCurrentCommandToHistory, getCommandParamters } from './index';


export default {

  name: 'ls',

  help: '',

  test: /^\s*ls.*$/,

  action(command) {
    return new Promise(async (resolve, reject) => {
      try {
        const { params } = getCommandParamters(command);
        const path = _path.resolve(
          params.join('') || appState.get('path'),
        );
        const res = await api(`/graphql?query={
          ls(path:"${path}") {
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
        const columns = Math.floor(window.innerWidth / 150);
        const inline = columns > 1 ? columns : 1;

        if (files.length) {
          files.forEach((file) => {
            historyCommands.push({
              inline,
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
