/* eslint-disable no-restricted-syntax */

import { File, FILETYPE, ROOTID } from '../models';

// export const ERR_PARENT_NOT_FOUND = new Error(`parent file not found!`);
export const ERR_FILE_ALREADY_EXIST = new Error('file already exist!');
export const ERR_FILE_NOT_EXIST = new Error('file not exist!');
export const ERR_PARENT_SHOULD_BE_A_FOLDER = new Error('parent should be a folder');

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

export function createFile({ name, type, parentId, mode,
  linkTo, createIfNotExist, force, userId }) {
  return new Promise(async (resolve, reject) => {
    let newFile;
    try {
      if (parentId === ROOTID) {
        // if parentId is 0 ( in root )
        const file = await File.findOne({
          where: { name, type, underRoot: true },
        });
        if (file && !force) throw ERR_FILE_ALREADY_EXIST;
        if (file) file.destroy();
        newFile = await File.create({
          underRoot: true,
          userId,
          name,
          type,
          mode,
          linkTo,
          path: `/${name}`,
        });
        resolve(newFile);
        return;
      }

      const parentFile = await findFileById(parentId);
      if (parentFile.get('type') === FILETYPE.f) throw ERR_PARENT_SHOULD_BE_A_FOLDER;

      const subFiles = await parentFile.getSubFile({
        where: { name, type },
      });
      // file exist
      if (subFiles.length) {
        if (createIfNotExist) {
          resolve();
          return;
        }
        if (!force) throw ERR_FILE_ALREADY_EXIST;
        subFiles[0].destroy();
      }

      newFile = await parentFile.createSubFile({
        userId,
        name,
        type,
        mode,
        linkTo,
        path: `${parentFile.get('path')}/${name}}`,
      });
      resolve(newFile);
    } catch (err) {
      if (newFile) newFile.destroy();
      reject(err);
    }
  });
}

export function findOneFile({ name, type, parentId = ROOTID,
  createdAt, updatedAt, mode, linkTo }) {
  return new Promise(async (resolve, reject) => {
    try {
      if (parentId === ROOTID) {
        const file = await File.findOne({
          where: fliterObject({ underRoot: true,
            name,
            type,
            mode,
            linkTo,
            createdAt,
            updatedAt }),
        });
        if (!file) throw ERR_FILE_NOT_EXIST;
        resolve(file);
        return;
      }

      const parentFile = await findFileById(parentId);
      const subfiles = parentFile.getSubFile({
        where: fliterObject({ name,
          type,
          mode,
          linkTo,
          createdAt,
          updatedAt }),
      });
      if (subfiles.length) throw ERR_FILE_NOT_EXIST;
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
      if (id === ROOTID) {
        resolve(await File.findAll({
          where: { underRoot: true },
        }));
        return;
      }

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
      if (parentId === ROOTID) {
        const files = await File.findAll({
          where: { name },
        });
        resolve(files);
        return;
      }

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
