/* eslint-disable global-require */

import is from 'is_js';
import appState from '../core/state';
import { AT, COLON, DOLLAR } from '../constants';

const commandsPath = [
  'ls',
  'list',
  'touch',
  'clear',
  'logout',
  'help',
  'mkdir',
  'cd',
  'rm',
  'read',
  'mv',
];

export const myCommands = commandsPath
  .map(c => require(`./${c}`).default); // eslint-disable-line

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
  document.querySelector('input').value = '';
}

export function createNewLine(head) {
  addCurrentCommandToHistory(head);
  clearCurrentCommand();
}

export function getCommandParamters(command) {
  const inputs = command.split(' ');
  const tmp = inputs.slice(1, inputs.length); // eslint-disable-line
  const options = [];
  const params = [];
  let fragment = tmp.pop();

  while (fragment) {
    if (fragment.charAt(0) === '-') {
      options.unshift(fragment);
    } else {
      params.unshift(fragment);
    }

    fragment = tmp.pop();
  }

  return {
    options, params,
  };
}

export function printError(errors) {
  const { historyCommands } = appState;

  errors.forEach((error) => {
    historyCommands.push({
      text: error.message,
      style: { color: 'red' },
    });
  });

  appState.trigger('historyCommands');
}

function recardInput(input) {
  const history = appState.get('history');
  history.push(input.split(''));
  appState.set('history', history);
}

export default async function (command, cb) {
  if (appState.get('lockCommand')) {
    return;
  }

  let hit = false;
  let shouldCreateNewLine = true;

  for (let i = 0; i < myCommands.length; i += 1) {
    if (is.function(myCommands[i].test)) {
      hit = myCommands[i].test(command);
    } else if (is.regexp(myCommands[i].test)) {
      hit = myCommands[i].test.test(command);
    }
    if (!hit) {
      continue; // eslint-disable-line no-continue
    }

    appState.update('lockCommand', true);

    try {
      // eslint-disable-next-line no-await-in-loop
      shouldCreateNewLine = await myCommands[i].action(command);
    } catch (err) {
      console.error(err); //eslint-disable-line
    }
    break;
  }

  if (!hit || shouldCreateNewLine) {
    createNewLine(true);
  }

  recardInput(command);

  setTimeout(() => {
    if (cb && cb instanceof Function) {
      cb();
    }
    appState.update('lockCommand', false);
  }, 0);
}
