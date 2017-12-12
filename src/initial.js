import fs from 'fs';
import { log } from './core/utils';
import {
  dataDir,
  initialFile,
  email,
  username,
  password,
} from './config';
import {
  User, UserGroup,
  File, ROOTID,
  FILETYPE,
} from './data/models';


function initialGroup() {
  return new Promise(async (resolve, reject) => {
    log('now is initial user group...');
    try {
      await UserGroup.create({ name: 'root' });
      await UserGroup.create({ name: 'user' });
      resolve(true);
    } catch (err) {
      reject(err);
    }
  });
}

function createRootUser() {
  return new Promise(async (resolve, reject) => {
    log('now is initial root user...');
    try {
      const root = await User.create({
        email,
        username,
        password,
        homePath: `/${username}`,
      });
      resolve(root);
    } catch (err) {
      reject(err);
    }
  });
}

function shoudlInitial() {
  return !fs.existsSync(initialFile);
}

function createRoot(root) {
  return new Promise(async (resolve, reject) => {
    log('now is initial root folder');
    try {
      await File.create({
        id: ROOTID,
        name: root.username,
        type: FILETYPE.d,
        mode: '755',
        userId: root.id,
        linkTo: 'none',
        path: '/',
      });
      await File.create({
        name: root.username,
        userId: root.id,
        parentId: ROOTID,
        type: FILETYPE.d,
        mode: '755',
        linkTo: 'none',
        path: `/${username}`,
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function createUploadDataFolder() {
  log('now is initial upload folder...');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
  }
}

export default async function () {
  try {
    if (!await shoudlInitial()) return;
    createUploadDataFolder();
    if (!fs.existsSync(initialFile)) {
      await initialGroup();
      const root = await createRootUser();
      await createRoot(root);
      fs.closeSync(fs.openSync(initialFile, 'w'));
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}
