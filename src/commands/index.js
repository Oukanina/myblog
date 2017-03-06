import is from 'is_js';
import appState from '../core/state';
import { AT, COLON, DOLLAR } from '../constants';

import logout from './logout';

const myCommands = [
  logout,
];

function createNewLine() {
  const historyCommands = appState.get('historyCommands');
  const currentCommand = appState.get('currentCommand');
  const username = appState.get('username');
  const hostname = appState.get('hostname');
  const path = appState.get('path');
  historyCommands.push({
    lineHead: `${username}${AT}${hostname}${COLON}${path}${DOLLAR}`,
    text: currentCommand,
  });
  appState.update('currentCommand', []);
  appState.update('historyCommands', historyCommands);
}

export default async function (command) {
  let hit = false;
  let goAhead;
  for (let i = 0; i < myCommands.length; i += 1) {
    if (is.function(myCommands[i].test)) {
      hit = myCommands[i].test(command);
    } else if (is.regexp(myCommands[i].test)) {
      hit = myCommands[i].test.test(command);
    }
    if (!hit) continue; // eslint-disable-line no-continue
    goAhead = await myCommands[i].action(command); // eslint-disable-line no-await-in-loop
    if (!goAhead) return;
    break;
  }

  createNewLine();
}
