import _path from 'path';
import appState from '../core/state';
import api from '../core/api';
import { getCommandParamters, addCurrentCommandToHistory } from './index';

export default {

  name: 'cd',

  help: 'Change directory',

  test: /^\s*cd.*$/,

  action(command) {
    return new Promise(async (resolve, reject) => {
      try {
        const { params } = getCommandParamters(command);
        let res;
        let json = {
          data: {
            cd: {
              path: '',
            },
          },
        };
        if (!params[0] || params[0] === '~') {
          json.data.cd.path = appState.get('HOME');
        } else {
          const path = _path.resolve(appState.getPath(), params[0]);
          const headers = new Headers();

          headers.append('Content-Type', 'application/json');
          res = await api('/graphql', {
            method: 'post',
            headers,
            body: JSON.stringify({
              query: `
              mutation{
                cd(path:"${path}") {
                  name, path, error
                }
              }
              `,
            }),
          });
          json = await res.json();
        }

        addCurrentCommandToHistory();

        if (json.errors) {
          const { historyCommands } = appState;

          historyCommands.push({
            text: json.errors[0].message,
            style: { color: 'red' },
          });
        } else {
          appState.update('path', json.data.cd.path);
        }

        resolve(false);
        appState.update('currentCommand', []);
        appState.trigger('historyCommands');
        appState.update('cursorPosition', 1);
      } catch (err) {
        reject(err);
      }
    });
  },
};
