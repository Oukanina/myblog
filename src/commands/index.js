/* eslint-disable global-require */

import is from 'is_js';
import appState from '../core/state';
import { AT, COLON, DOLLAR } from '../constants';

export const myCommands = [
  require('./ls').default,
  require('./touch').default,
  require('./clear').default,
  require('./logout').default,
  require('./navigation').default,
  require('./help').default,
];

export function getLineHead() {
  const username = appState.get('username');
  const hostname = appState.get('hostname');
  const path = appState.get('path');
  return `${username}${AT}${hostname}${COLON}${path}${DOLLAR}`;
}

export function addCurrentCommandToHistory(head) {
  const historyCommands = appState.get('historyCommands');
  const currentCommand = appState.get('currentCommand');

  historyCommands.push({
    lineHead: head ? getLineHead() : '',
    text: currentCommand.join(''),
  });
  appState.update('historyCommands', historyCommands);
}

export function clearCurrentCommand() {
  appState.update('currentCommand', []);
  appState.update('cursorPosition', 1);
}

export function createNewLine(head) {
  addCurrentCommandToHistory(head);
  clearCurrentCommand();
}

export default async function (command) {
  let hit = false;
  let canNewLine = true;

  for (let i = 0; i < myCommands.length; i += 1) {
    if (is.function(myCommands[i].test)) {
      hit = myCommands[i].test(command);
    } else if (is.regexp(myCommands[i].test)) {
      hit = myCommands[i].test.test(command);
    }
    if (!hit) continue; // eslint-disable-line no-continue
    canNewLine = await myCommands[i].action(command); // eslint-disable-line no-await-in-loop
    break;
  }

  if (!hit || canNewLine) {
    createNewLine(true);
  }
}
