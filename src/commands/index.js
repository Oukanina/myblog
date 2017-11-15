/* eslint-disable global-require */

import is from 'is_js';
import appState from '../core/state';
import { AT, COLON, DOLLAR } from '../constants';

export const myCommands = [
  require('./ls').default,
  require('./touch').default,
  require('./clear').default,
  require('./logout').default,
  // require('./navigation').default,
  require('./help').default,
  require('./mkdir').default,
  require('./cd').default,
];

export function getLineHead() {
  const username = appState.get('username');
  const hostname = appState.get('hostname');
  const path = appState.get('path');
  const HOME = appState.get('HOME');
  const pathString = path === HOME ? '~' : path;
  return `${username}${AT}${hostname}${COLON}${pathString}${DOLLAR}`;
}

export function addCurrentCommandToHistory(head = true) {
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

export function getCommandParamters(command) {
  const inputs = command.match(/-?[\w|/.+|~]+/gm);
  const options = [];
  const params = [];

  for (let i = 1; i < inputs.length; i += 1) {
    if (inputs[i].charAt(0) === '-') {
      options.push(inputs[i]);
    } else {
      params.push(inputs[i]);
    }
  }

  return {
    options, params,
  };
}

function recardInput(input) {
  const history = appState.get('history');
  history.push(input.split(''));
  appState.set('history', history);
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
    if (!hit) {
      continue; // eslint-disable-line no-continue
    }

    try {
      canNewLine = await myCommands[i].action(command); // eslint-disable-line no-await-in-loop
    } catch (err) {
      console.error(err); //eslint-disable-line
    }
    break;
  }

  if (!hit || canNewLine) {
    createNewLine(true);
  }

  recardInput(command);
}
