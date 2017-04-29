/* eslint-disable import/no-webpack-loader-syntax,
  import/no-unresolved, no-plusplus */

import Lockr from 'lockr';
import UploadWorker from 'worker-loader!../workers/uploadWorker';
import appState from '../core/state';
import { getLineHead, createNewLine } from './index';
import { on } from '../core/utils';


function prepareCommandLine() {
  const historyCommands = appState.get('historyCommands');
  const currentCommand = appState.get('currentCommand');

  historyCommands.push({
    lineHead: getLineHead(),
    text: currentCommand.join(''),
  });
  historyCommands.push({
    text: 'please select a file',
  });

  // appState.update('hideLastLine', true);
  appState.update('currentCommand', []);
  appState.trigger('historyCommands');
  appState.update('cursorPosition', 1);
}

function inputChangeHandler(resolve) {
  return (e) => {
    e.preventDefault();
    const files = e.target.files;
    if (!window.Worker) throw new Error('doesn\'t support web worker!');

    const uploadWorker = new UploadWorker();
    const host = window.location.host;
    const token = Lockr.get('token');
    const path = appState.get('path');
    let i = 0;

    const doUpload = (file) => {
      if (file) {
        uploadWorker.postMessage({ file, host, token, path });
      } else {
        appState.update('hideLastLine', false);
        appState.update('currentCommand', []);
        uploadWorker.terminate();
        resolve(false);
      }
    };

    appState.update('hideLastLine', true);
    uploadWorker.onmessage = (e2) => {
      const message = JSON.parse(e2.data);
      appState.update('currentCommand', [
        `Uploading: ${message.name} => ${message.progress}%`]);
      if (message.status === 'finish') {
        createNewLine();
        doUpload(files[i++]);
      }
    };
    doUpload(files[i++]);
  };
}

function openFileSelectWindow(resolve) {
  const input = document.createElement('input');
  input.type = 'file';
  input.multiple = true;
  on(input, 'change', inputChangeHandler(resolve));
  input.click();
  return input;
}

export default {

  name: 'touch',

  test: /^\s*touch\s*$/,

  action() {
    return new Promise(async (resolve, reject) => {
      try {
        prepareCommandLine();
        openFileSelectWindow(resolve);
      } catch (err) {
        reject(err);
      }
    });
  },

};
