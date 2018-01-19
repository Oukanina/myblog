/* eslint-disable no-restricted-syntax */

import { File, FILETYPE, ROOTID, LINKTO } from '../models';
import { getUserById } from './userUtils';

export const ERR_PARENT_NOT_FOUND = new Error('parent file not found!');
export const ERR_FILE_ALREADY_EXIST = new Error('file already exist!');
export const ERR_FILE_NOT_EXIST = new Error('file not exist!');
export const ERR_PARENT_SHOULD_BE_A_FOLDER = new Error('parent should be a folder!');
export const ERR_CAN_NOT_GET_HOME_FOLDER = new Error('can not find home folder!');
export const ERR_NO_PARAMETER = new Error('no parameter!');

export function fliterObject(object) {
  const newObject = {};
  for (const p in object) {
    if (object[p] !== undefined) {
      newObject[p] = object[p];
    }
  }
  return newObject;
}

export function findFileById(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const file = await File.findOne({
        where: { id },
      });
      if (!file) throw ERR_FILE_NOT_EXIST;
      resolve(file);
    } catch (err) {
      reject(err);
    }
  });
}

export function fileExists({ parent, name, type }) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await parent.getSubFile({
        where: { name, type },
      }));
    } catch (err) {
      reject(err);
    }
  });
}

export function createFile({ id, name, type, parentId, parentFolder, mode,
  linkTo, createIfNotExist, force, userId, user }) {
  return new Promise(async (resolve, reject) => {
    let newFile;
    try {
      if (!userId) {
        if (user) {
          userId = user.get('id'); // eslint-disable-line no-param-reassign
        } else {
          throw ERR_NO_PARAMETER;
        }
      }

      let parent;

      if (parentFolder) {
        parent = parentFolder;
      } else if (parentId) {
        parent = await findFileById(parentId);
      } else {
        throw ERR_NO_PARAMETER;
      }
      if (!parent) throw ERR_PARENT_NOT_FOUND;
      if (parent.get('type') === FILETYPE.f) throw ERR_PARENT_SHOULD_BE_A_FOLDER;

      const subFiles = await parent.getSubFile({
        where: { name, type },
      });

      // file exist
      if (subFiles.length) {
        if (createIfNotExist) {
          resolve(subFiles[0]);
          return;
        }
        if (!force) throw ERR_FILE_ALREADY_EXIST;
        subFiles[0].destroy();
      }
      const parentPath = parent.get('path');
      newFile = await parent.createSubFile(fliterObject({
        id,
        userId,
        name,
        type,
        mode,
        linkTo,
        path: `${parentPath === '/' ? '' : parentPath}/${name}`,
      }));
      resolve(newFile);
    } catch (err) {
      if (newFile) await newFile.destroy();
      reject(err);
    }
  });
}

export function findFileByPath(path) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await File.findOne({
        where: { path },
      }));
    } catch (err) {
      reject(err);
    }
  });
}

export function createFolder({ id, name, parentId, mode = '664',
  linkTo, createIfNotExist, force, userId }) {
  return new Promise(async (resolve, reject) => {
    let newFolder;
    try {
      newFolder = await createFile(fliterObject({
        id,
        name,
        type: FILETYPE.d,
        parentId,
        mode,
        linkTo,
        createIfNotExist,
        force,
        userId }));
      resolve(newFolder);
    } catch (err) {
      if (newFolder) newFolder.destroy();
      reject(err);
    }
  });
}

export function findOneFile({ id, name, type, parentId = ROOTID,
  createdAt, updatedAt, mode, linkTo }) {
  return new Promise(async (resolve, reject) => {
    try {
      const parentFile = await findFileById(parentId);
      const subfiles = await parentFile.getSubFile({
        where: fliterObject({
          id,
          mode,
          name,
          type,
          linkTo,
          createdAt,
          updatedAt }),
      });
      if (subfiles.length === 0) throw ERR_FILE_NOT_EXIST;
      resolve(subfiles[0]);
      return;
    } catch (err) {
      reject(err);
    }
  });
}

export function findOneFileByName(name, parentId = ROOTID) {
  return findOneFile({
    name, parentId,
  });
}

export function findOneFolderByName(name, parentId = ROOTID) {
  return findOneFile({
    name, parentId, type: FILETYPE.d,
  });
}

export function findOneRegularFileByName(name, parentId = ROOTID) {
  return findOneFile({
    name, parentId, type: FILETYPE.f,
  });
}

export function getFileChildren(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const file = await File.findOne({
        where: { id },
      });
      if (!file) throw ERR_FILE_NOT_EXIST;
      resolve(await file.getSubFile());
    } catch (err) {
      reject(err);
    }
  });
}

export function isFolder(file) {
  return file.get('type') === FILETYPE.d;
}

export function searchFilesByName(name, parentId = ROOTID) {
  return new Promise(async (resolve, reject) => {
    try {
      const parentFile = await findFileById(parentId);
      if (!isFolder(parentFile)) throw ERR_PARENT_SHOULD_BE_A_FOLDER;
      const files = await File.findOne({
        where: {
          path: {
            $like: `${parentFile.get('path')}/%/${name}`,
          },
        },
      });
      resolve(files);
    } catch (err) {
      reject(err);
    }
  });
}

export function getUserHomeFolder(user) {
  return new Promise(async (resolve, reject) => {
    try {
      const homeFolder = await File.findOne({
        where: { path: user.get('homePath') },
      });
      if (!homeFolder) throw ERR_CAN_NOT_GET_HOME_FOLDER;
      resolve(homeFolder);
    } catch (err) {
      reject(err);
    }
  });
}

export function getFileByPath(path, type = FILETYPE.f) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await File.findOne({
        where: { path, type },
      }));
    } catch (err) {
      reject(err);
    }
  });
}

export function getFolderByPath(path) {
  return getFileByPath(path, FILETYPE.d);
}

export function mkdir({ name, path, userId, mode = '664' }) {
  return new Promise(async (resolve, reject) => {
    try {
      let parent;
      if (path === '~') {
        const user = await getUserById(userId);
        parent = await getUserHomeFolder(user);
      } else {
        parent = await getFolderByPath(path);
      }
      if (!parent) throw ERR_PARENT_NOT_FOUND;

      resolve(await createFolder({
        name,
        userId,
        mode,
        linkTo: LINKTO.none,
        parentId: parent.id,
      }));
    } catch (err) {
      reject(err);
    }
  });
}

async function rmFile({ file, recurrence = false }) {
  if (file.type === FILETYPE.d && recurrence) {
    await File.destroy({
      where: {
        $or: {
          parentId: file.get('id'),
          id: file.get('id'),
        },
      },
    });
  } else if (file.type === FILETYPE.f) {
    await file.destroy();
  } else if (file.type === FILETYPE.d && !recurrence) {
    throw new Error(`can not remove directory ${file.name} without -r`);
  } else {
    throw new Error(`remove ${file.name} failed!`);
  }
}

export function rm({ path, recurrence = false }) {
  return new Promise(async (resolve, reject) => {
    try {
      const file = await findFileByPath(path);

      if (!file) {
        throw ERR_FILE_NOT_EXIST;
      } else {
        rmFile({ file, recurrence });
        resolve(file);
      }
    } catch (err) {
      reject(err);
    }
  });
}

function convertWildcard(path) {
  let tmp = '';
  let i = 0;

  while (path.charAt(i)) {
    if (path.charAt(i) === '\'') {
      i += 1;

      while (path.charAt(i)) {
        if (path.charAt(i) === '\'') {
          break;
        } else {
          tmp += path.charAt(i);
        }
        i += 1;
      }
    } else if (path.charAt(i) === '[') {
      tmp += path.charAt(i);
      i += 1;

      while (path.charAt(i)) {
        if (path.charAt(i) === ']') {
          tmp += path.charAt(i);
          break;
        } else if (path.charAt(i) === ',') {
          tmp += '';
        } else if (path.charAt(i) === '*') {
          tmp += '%';
        } else {
          tmp += path.charAt(i);
        }
        i += 1;
      }
    // } else if (path.charAt(i) === '{') {
    } else if (path.charAt(i) === '*') {
      tmp += '%';
    } else {
      tmp += path.charAt(i);
    }
    i += 1;
  }

  return tmp;
}

export function rmWithWildcard({ path, recurrence = false }) {
  return new Promise(async (resolve, reject) => {
    try {
      const files = await File.findAll({
        where: {
          path: {
            $like: convertWildcard(path),
          },
        },
      });

      for (const file of files) {
        rmFile({ file, recurrence });
      }

      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function mv({ files = [], target } = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const parent = await File.findOne({
        where: { path: target },
      });
      const children = await File.findAll({
        where: {
          $or: files.map(f => ({
            path: {
              $like: convertWildcard(f),
            },
          })),
        },
      });

      if (!parent) {
        if (children.length === 1) {
          if (target.endsWith('/') || children.length !== 1) {
            throw new Error(`mv: target '${target}' is not a directory`);
          } else {
            await children[0].update({
              name: target.split('/').pop(),
              path: target,
            });
          }
        }
      } else {
        const t = [];

        for (const c of children) {
          t.push(c.update({
            parentId: parent.id,
            path: `${parent.path}/${c.name}`,
          }));
        }

        await Promise.all(t);
      }


      resolve();
    } catch (err) {
      reject(err);
    }
  });
}
