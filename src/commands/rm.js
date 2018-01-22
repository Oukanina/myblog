import _path from 'path';
import appState from '../core/state';
import api from '../core/api';
import { addCurrentCommandToHistory, getCommandParamters } from './index';


export default {

  name: 'rm',

  help: '',

  test: /^\s*rm.*$/,

  action(command) {
    return new Promise(async (resolve, reject) => { // eslint-disable-line
      try {
        const { params, options } = getCommandParamters(command);

        if (
          !params[0] ||
          params[0] === '/' ||
          params[0] === '/root'
        ) {
          return resolve(true);
        }

        params[0] = _path.resolve(appState.getPath(), params[0]);
        const res = await api('/graphql', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              mutation{
                rm(path:"${params[0]}", options:"${options}") {
                  name, error
                }
              }
            `,
          }),
        });

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
        resolve(false);
      } catch (err) {
        reject(err);
      }
    });
  },
};
