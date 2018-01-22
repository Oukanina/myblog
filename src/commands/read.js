import path from 'path';
import appState from '../core/state';
import api from '../core/api';
import {
  addCurrentCommandToHistory,
  getCommandParamters,
} from './index';

export default {

  name: 'read',

  help: '',

  test: /^\s*[read|listen|open|watch].*$/,

  action(command) {
    return new Promise(async (resolve, reject) => {
      try {
        const { params } = getCommandParamters(command);
        const res = await api(`/graphql?query={
          read(path:"${
            path.resolve(
              appState.getPath(),
              params[0],
            )
          }") {
            id, error
          }
        }`).catch((err) => { throw err; });

        const json = await res.json();

        addCurrentCommandToHistory(true);

        if (json.errors) {
          const { historyCommands } = appState;

          historyCommands.push({
            text: json.errors[0].message,
            style: { color: 'red' },
          });
        }

        appState.trigger('historyCommands');
        appState.update('currentCommand', []);
        appState.update('cursorPosition', 1);

        if (json.data.read.id) {
          window.location.assign(`/read/${
            json.data.read.id
          }`);
        }
        // if need create a new line then pass true
        resolve(false);
      } catch (err) {
        reject(true);
      }
    });
  },
};
