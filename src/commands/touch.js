/* eslint-disable import/no-webpack-loader-syntax,
  import/no-unresolved, no-plusplus */

import Lockr from 'lockr';
import UploadWorker from 'worker-loader!../workers/uploadWorker';
import appState from '../core/state';
import { addCurrentCommandToHistory, clearCurrentCommand } from './index';
import { on } from '../core/utils';

function prepareCommandLine() {
  const { historyCommands } = appState;

  addCurrentCommandToHistory(true);
  clearCurrentCommand();

  historyCommands.push({
    text: 'choose file...',
    style: { color: 'yellow' },
  });
  appState.trigger('historyCommands');
}

function finishUpload() {
  appState.update('hideLastLine', false);
  appState.update('currentCommand', []);
}

function startUpload(resolve, files) {
  const { historyCommands } = appState;
  const uploadWorker = new UploadWorker();
  const host = window.location.host;
  const token = Lockr.get('token');
  const path = appState.getPath();
  let isOnUplading = false;
  let i = 0;

  const doUpload = (file) => {
    if (file) {
      uploadWorker.postMessage({ file, host, token, path });
    } else {
      finishUpload();
      uploadWorker.terminate();
      resolve(false);
    }
  };

  appState.update('hideLastLine', true);

  uploadWorker.onmessage = (e2) => {
    const message = JSON.parse(e2.data);

    if (message.status === 'error') {
      historyCommands.push({
        text: message.data,
      });
      finishUpload();
      uploadWorker.terminate();
      resolve(false);
      return;
    }

    if (!isOnUplading) {
      historyCommands.push({
        text: `uploading ${message.progress}%`,
        style: { color: 'green' },
      });
    }

    if (message.status === 'finish') {
      historyCommands[historyCommands.length - 1] = {
        text: `${message.name} ${message.progress}%`,
        style: { color: 'green' },
      };
      isOnUplading = false;

      doUpload(files[i++]);
    } else {
      if (isOnUplading) {
        historyCommands[historyCommands.length - 1] = {
          text: `uploading ${message.progress}%`,
          style: { color: 'green' },
        };
      }
      isOnUplading = true;
    }

    appState.update('historyCommands', historyCommands);
  };

  doUpload(files[i++]);
}

function inputChangeHandler(resolve) {
  return (e) => {
    e.preventDefault();
    const files = e.target.files;

    if (!window.Worker) {
      console.error('doesn\'t support web worker!'); // eslint-disable-line
      resolve(false);
    }
    if (files.length < 1) {
      resolve(false);
    }

    try {
      startUpload(resolve, files);
    } catch (err) {
      throw err;
    }
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

  help: 'Upload a file',

  name: 'upload',

  test: /^\s*touch|upload.*$/,

  action() {
    return new Promise(async (resolve, reject) => {
      try {
        if (!window.Worker) throw new Error('doesn\'t support web worker!');
        prepareCommandLine();
        setTimeout(() => {
          openFileSelectWindow(resolve);
        }, 50);
      } catch (err) {
        reject(err);
      }
    });
  },

};
