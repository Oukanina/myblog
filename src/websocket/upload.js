
/* eslint-disable no-underscore-dangle, no-mixed-operators */


import fs from 'fs';
import { verify } from 'jsonwebtoken';
import uuidv4 from 'uuid/v4';
import { auth, dataDir } from '../config.js';
import { TILDE } from '../constants';
import { FILETYPE, LINKTO } from '../data/models';
import { getUserByToken } from '../data/utils/userUtils.js';
import { getUserHomeFolder, getFolderByPath, createFile } from '../data/utils/fileUtils.js';

const ALLOW_FILE_TYPE = ['image/jpeg', 'image/png', 'text/markdown'];
const MAX_FILE_SIZE = 1024 * 1024 * 10;

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
      const name = file.name;
      let user = await getUserByToken(token);
      if (!user.length) throw new Error('FileSaveError');
      user = user[0];
      let folder;
      if (path === TILDE) {
        folder = await getUserHomeFolder(user);
      } else {
        folder = await getFolderByPath(path);
      }
      const uid = uuidv4();
      const newFile = await createFile({
        name,
        user,
        id: uid,
        mode: '755',
        force: true,
        type: FILETYPE.f,
        parentFolder: folder,
        linkTo: LINKTO.article,
      });
      const suf = name.split('.').pop();
      const newPath = `${dataDir}/${uid}.${suf}`;
      fs.rename(`/tmp/${name}`, newPath, async () => {
        await newFile.createArticle({
          id: uid,
          path: newPath,
        });
        resolve();
      });
    } catch (err) {
      reject(err);
    }
  });
}

function openUpload(app, ws, { file, path, token }) {
  const uploadPath = uuidv4();
  const writer = fs.createWriteStream(`/tmp/${file.name}`);
  const endUpload = () => {
    writer.end();
    closeUpload(app, uploadPath);
  };

  app.ws(`/${uploadPath}`, (uplodWs) => {
    uplodWs.on('message', (message) => {
      const writtenSize = writer.bytesWritten + message.length;
      if (writtenSize > MAX_FILE_SIZE) throw new Error('FileSizeError');
      writer.write(message);
      uplodWs.send(Math.floor(100 * writtenSize / file.size));
    });
    uplodWs.on('close', async () => {
      if (writer.bytesWritten === file.size) {
        try {
          await saveFile({ file, path, token });
        } catch (err) {
          console.error(err); // eslint-disable-line no-console
        }
      }
      endUpload();
    });
    uplodWs.on('error', (err) => {
      console.error(err); // eslint-disable-line no-console
      endUpload();
    });
  });
  app._router.stack.unshift(app._router.stack.pop());

  return uploadPath;
}

function verifyFile({ type, size }) {
  if (size > MAX_FILE_SIZE) throw new Error('FileSizeError');
  if (!ALLOW_FILE_TYPE.includes(type)) throw new Error('FileTypeError');
}

function verifyFailed(err, ws) {
  switch (err.name) {
    case 'JsonWebTokenError':
    case 'TokenExpiredError':
    case 'FileSizeError':
    case 'FileTypeError':
    case 'NoTokenError':
    case 'NoFileError':
      ws.send(JSON.stringify({
        status: 'error',
        error: err.name,
      }));
      break;
    default:
      ws.send(JSON.stringify({
        status: 'error',
        error: 'UnknowError',
      }));
      break;
  }
}

export default (app) => {
  app.ws('/ws/upload', (ws) => {
    ws.on('message', (message) => {
      try {
        const json = JSON.parse(message);
        if (!json.token) throw new Error('NoTokenError');
        if (!json.file) throw new Error('NoFileError');

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
