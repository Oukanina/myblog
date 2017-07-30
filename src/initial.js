import fs from 'fs';
import {
  dataDir, initialFile,
  email, username, password } from './config';
import { User, UserGroup,
  File, ROOTID, FILETYPE } from './data/models';


function initialGroup() {
  return new Promise(async (resolve, reject) => {
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
    try {
      resolve(await User.create({
        email,
        username,
        password,
      }));
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
    try {
      await File.create({
        id: ROOTID,
        name: 'root',
        type: FILETYPE.d,
        mode: '755',
        userId: root.id,
        linkTo: 'none',
        path: '/',
      });
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export default async function () {
  try {
    if (!await shoudlInitial()) return;
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir);
    }
    if (!fs.existsSync(initialFile)) {
      await initialGroup();
      await createRoot(await createRootUser());
      fs.closeSync(fs.openSync(initialFile, 'w'));
    }
  } catch (err) {
    console.error(err); // eslint-disable-line no-console
  }
}
