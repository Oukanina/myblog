import _path from 'path';
import appState from '../core/state';
import api from '../core/api';
import {
  addCurrentCommandToHistory,
  getCommandParamters,
  printError,
} from './index';

export function getFolderChildren(path) {
  return new Promise(async (resolve, reject) => {
    try {
      const res = await api(`/graphql?query={
        ls(path:"${path}") {
          error,
          children {
            id
            name
            path
            type
          }
        }
      }`).catch((err) => { throw err; });
      const json = await res.json();
      resolve(json);
    } catch (err) {
      reject(err);
    }
  });
}

export function listFile(files = []) {
  if (!files.length) return;

  const historyCommands = appState.historyCommands;
  const columns = Math.floor(window.innerWidth / 150);
  const inline = columns > 1 ? columns : 1;

  files.sort((a, b) => a.name > b.name)
    .forEach((file) => {
      historyCommands.push({
        inline,
        text: file.name,
        style: file.type === 'd' ? {
          color: '#2ecc71',
        } : {
          color: '#cbcbcb',
        },
      });
    });

  appState.update('historyCommands', historyCommands);
}

export default {

  name: 'ls',

  help: '',

  test: /^\s*ls.*$/,

  action(command) {
    return new Promise(async (resolve, reject) => {
      try {
        const { params } = getCommandParamters(command);
        const path = _path.resolve(
          appState.get('path') || '',
          params[0] || '',
        );

        const json = await getFolderChildren(path);
        const files = json.data.ls.children || [];

        addCurrentCommandToHistory(true);
        appState.update('currentCommand', []);
        appState.update('cursorPosition', 1);

        listFile(files);

        if (json.errors) {
          printError(json.errors);
        }

        // if need create a new line then pass true
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  },
};
