/* eslint-disable no-underscore-dangle, no-mixed-operators */

import fs from 'fs';
import { verify } from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import { auth, dataDir } from '../config.js';
import { TILDE } from '../constants';
import { MyError } from '../core/utils.js';
import { FILETYPE, LINKTO } from '../data/models';
import { getUserByToken } from '../data/utils/userUtils.js';
import {
  getUserHomeFolder,
  getFolderByPath,
  createFile,
} from '../data/utils/fileUtils.js';
import { createUploadDataFolder } from '../initial.js';

const FILE_TYPE_LINK_MAP = {
  'image/jpeg': LINKTO.image,
  'image/png': LINKTO.image,
  'text/markdown': LINKTO.article,
  'audio/mp3': LINKTO.music,
  'audio/mpeg': LINKTO.music,
};
const ALLOW_FILE_TYPE = [
  'image/jpeg',
  'image/png',
  'text/markdown',
  'audio/mp3',
  'audio/mpeg',
];
const MAX_FILE_SIZE = (1 << 20) * 10; // eslint-disable-line
const FILE_SAVE_ERROR = new MyError('FileSaveError', 'File save error!');
const FILE_SIZEE_RROR = new MyError('FileSizeError',
  `File size too large! max file size is ${MAX_FILE_SIZE/(1 << 20)}mb`);  // eslint-disable-line
const FILE_TYPE_ERROR = new MyError('FileTypeError',
`Your can't upload {0} file! you can just upload: ${ALLOW_FILE_TYPE.join(',')}`);
const NO_TOKEN_ERROR = new MyError('NoTokenError', 'Permission denied!');
const NO_FILEE_RROR = new MyError('NoFileError', 'Permission denied!');

function closeUpload(app, path) {
  app._router.stack.forEach((route, i, routes) => {
    if (!route.route) return;
    if (route.route.path === path) {
      routes.splice(i, 1);
    }
  });
}

function saveFile({ file, path, token }) {
  return new Promise(async (resolve, reject) => {
    try {
      // change all spaces to -
      const name = file.name.replace(/\s/g, '-');
      let user = await getUserByToken(token);
      if (!user.length) throw FILE_SAVE_ERROR;
      user = user[0];
      let folder;
      if (path === TILDE) {
        folder = await getUserHomeFolder(user);
      } else {
        folder = await getFolderByPath(path);
      }
      const uid = uuidv4();
      const suf = name.split('.').pop();
      const newPath = `${dataDir}/${uid}.${suf}`;
      const newFile = await createFile({
        name,
        user,
        id: uid,
        mode: '755',
        force: true,
        type: FILETYPE.f,
        parentFolder: folder,
        linkTo: FILE_TYPE_LINK_MAP[file.type],
      });

      createUploadDataFolder();

      fs.rename(`/tmp/${name}`, newPath, async (err) => {
        if (err) return reject(err);

        await newFile.createArticle({
          id: uid,
          path: newPath,
        });
        return resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

function openUpload(app, ws, { file, path, token }) {
  const uploadPath = uuidv4();
  const writer = fs.createWriteStream(`/tmp/${file.name}`);
  const endUpload = (uws) => {
    writer.end();
    writer.close();
    uws.close();
    closeUpload(app, uploadPath);
  };

  app.ws(`/${uploadPath}`, (uplodWs) => {
    uplodWs.on('message', (message) => {
      try {
        const writtenSize = writer.bytesWritten + message.length;

        if (writtenSize > MAX_FILE_SIZE) {
          throw FILE_SIZEE_RROR;
        } else if (message) {
          writer.write(message);
          uplodWs.send(Math.floor(100 * writtenSize / file.size));
        }
      } catch (err) {
        console.error(err); // eslint-disable-line
        endUpload(uplodWs);
      }
    });
    uplodWs.on('close', async () => {
      try {
        endUpload(uplodWs);
        await saveFile({ file, path, token });
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
      }
    });
    uplodWs.on('error', (err) => {
      console.error(err); // eslint-disable-line no-console
      endUpload(uplodWs);
    });
  });
  app._router.stack.unshift(app._router.stack.pop());

  return uploadPath;
}

function verifyFile({ type, size }) {
  if (size > MAX_FILE_SIZE) throw FILE_SIZEE_RROR;
  if (!ALLOW_FILE_TYPE.includes(type)) {
    FILE_TYPE_ERROR.message = FILE_TYPE_ERROR.message.replace('{0}', type);
    throw FILE_TYPE_ERROR;
  }
}

function verifyFailed(err, ws) {
  switch (err.name) {
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
    case FILE_SIZEE_RROR.name:
    case FILE_TYPE_ERROR.name:
    case NO_TOKEN_ERROR.name:
    case NO_FILEE_RROR.name:
      ws.send(JSON.stringify({
        status: 'error',
        error: err.name,
        data: err.message,
      }));
      break;
    default:
      ws.send(JSON.stringify({
        status: 'error',
        error: 'UnknowError',
        data: 'UnknowError',
      }));
      break;
  }
}

export default (app) => {
  app.ws('/ws/upload', (ws) => {
    ws.on('message', (message) => {
      try {
        const json = JSON.parse(message);
        if (!json.token) throw NO_TOKEN_ERROR;
        if (!json.file) throw NO_FILEE_RROR;

        verify(json.token, auth.jwt.secret);
        verifyFile(json.file);

        ws.send(JSON.stringify({
          status: 'success',
          path: openUpload(app, ws, json),
        }));
      } catch (err) {
        console.error(err); // eslint-disable-line no-console
        verifyFailed(err, ws);
      }
    });
  });
};
