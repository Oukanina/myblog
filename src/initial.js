import fs from 'fs';
import { log } from './core/utils';
import {
  dataDir,
  initialFile,
  machineName,
  email,
  username,
  password,
} from './config';
import {
  User, Group,
  File, ROOTID,
  FILETYPE,
} from './data/models';
import { createUser, encode } from './data/utils/userUtils';


function createRootGroup() {
  return Group.create({ name: 'root' });
}

function createRootUser() {
  return new Promise(async (resolve, reject) => {
    log('now is initial root user...');
    try {
      const group = await createRootGroup();
      const root = await User.create({
        email: `root@${machineName}.com`,
        username: 'root',
        password: encode(password),
        homePath: '/root',
      });
      root.addGroup(group);
      resolve(root);
    } catch (err) {
      reject(err);
    }
  });
}

function createCustomUser() {
  return new Promise(async (resolve, reject) => {
    log('now is initial custom user...');
    try {
      const u = await createUser({
        email,
        username,
        password,
      });
      resolve(u);
    } catch (err) {
      reject(err);
    }
  });
}

function createAnonymousUser() {
  return new Promise(async (resolve, reject) => {
    log('now is initial anonymous user...');
    try {
      const anonymous = await createUser({
        email: `anonymous@${machineName}.com`,
        username: 'anon',
        password: 'anon',
        homePath: '/home/anon',
      });
      resolve(anonymous);
    } catch (err) {
      reject(err);
    }
  });
}

function shoudlInitial() {
  return !fs.existsSync(initialFile);
}

function createBase(root) {
  return new Promise(async (resolve, reject) => {
    log('now is initial root folder');
    try {
      await Promise.all([
        File.create({
          id: ROOTID,
          name: 'root',
          type: FILETYPE.d,
          mode: '740',
          userId: root.id,
          linkTo: 'none',
          path: '/',
        }),

        File.create({
          name: 'root',
          userId: root.id,
          parentId: ROOTID,
          type: FILETYPE.d,
          mode: '700',
          linkTo: 'none',
          path: '/root',
        }),

        File.create({
          name: 'home',
          userId: root.id,
          parentId: ROOTID,
          type: FILETYPE.d,
          mode: '700',
          linkTo: 'none',
          path: '/home',
        }),
      ]);
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

export default function () {
  return new Promise(async (resolve, reject) => {
    try {
      if (await shoudlInitial()) {
        createUploadDataFolder();
        if (!fs.existsSync(initialFile)) {
          await createBase(await createRootUser());
          await createCustomUser();
          await createAnonymousUser();
          fs.closeSync(fs.openSync(initialFile, 'w'));
        }
      }
      resolve();
    } catch (err) {
      console.error(err); // eslint-disable-line no-console
      reject(err);
    }
  });
}
