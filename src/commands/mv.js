import _path from 'path';
import appState from '../core/state';
import api from '../core/api';
import {
  addCurrentCommandToHistory,
  getCommandParamters,
  printError,
} from './index';

export default {

  name: 'mv',

  help: '',

  test: /^\s*mv.*$/,

  action(command) {
    return new Promise(async (resolve, reject) => {
      try {
        const { params } = getCommandParamters(command);
        const paths = params.map(p => _path.resolve(
          appState.getPath(),
          p || '',
        ));
        const res = await api('/graphql', {
          method: 'post',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `
              mutation{
                mv(paths:"${paths}") {
                  error,
                  children {
                    id
                    name
                    type
                  }
                }
              }
            `,
          }),
        }).catch((err) => { throw err; });

        const json = await res.json();

        addCurrentCommandToHistory(true);

        if (json.errors) {
          printError(json.errors);
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
