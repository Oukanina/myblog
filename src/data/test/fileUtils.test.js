import is from 'is_js';
import { FILETYPE, LINKTO, ROOTID } from '../models';
import {
  createFile, findOneFileByName, getFileChildren, findOneFolderByName,
  searchFilesByName,
  ERR_FILE_ALREADY_EXIST, ERR_FILE_NOT_EXIST } from '../utils/fileUtils';

import { createUser } from '../utils/userUtils';

const ERR_TASK_FAILED = new Error('Task failed!');

describe('File utils test: ', () => {

  it('should create a file', async () => {
    try {
      const testUser = await createUser({
        email: 'guo.ke.ke.a.test@gmail.com',
        password: 'test',
      });
      const file = await createFile({
        userId: testUser.get('id'),
        name: 'test',
        type: FILETYPE.f,
        parentId: ROOTID,
        mode: '755',
        linkTo: LINKTO.article,
        force: true,
      });

      testUser.destroy();
      if (!file) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    }
  });

  it('should thorw a error for file exist!', async () => {
    let testUser;
    try {
      testUser = await createUser({
        email: 'guo.ke.ke.a.test@gmail.com',
        password: 'test',
      });
      await createFile({
        userId: testUser.get('id'),
        name: 'test',
        type: FILETYPE.f,
        parentId: ROOTID,
        mode: '755',
        linkTo: LINKTO.article,
      });
    } catch (err) {
      testUser.destroy();
      if (err !== ERR_FILE_ALREADY_EXIST) throw err;
    }
  });

  it('should throw a error for file not exist!', async () => {
    let testUser;
    try {
      testUser = await createUser({
        email: 'guo.ke.ke.a.test@gmail.com',
        password: 'test',
      });
      await createFile({
        userId: testUser.get('id'),
        name: 'test',
        type: FILETYPE.f,
        parentId: 'lalalalalala',
        mode: '755',
        linkTo: LINKTO.article,
      });
    } catch (err) {
      testUser.destroy();
      if (err !== ERR_FILE_NOT_EXIST) throw err;
    }
  });

  const fileName = `test_${Date.now().toString()}`;
  it(`should crate a file named ${fileName}`, async () => {
    try {
      const testUser = await createUser({
        email: 'guo.ke.ke.a.test@gmail.com',
        password: 'test',
      });
      await createFile({
        name: fileName,
        type: FILETYPE.f,
        parentId: ROOTID,
        mode: '755',
        linkTo: LINKTO.article,
      });

      testUser.destroy();
      const theFile = await findOneFileByName(fileName, ROOTID);
      if (theFile.get('name') !== fileName) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    }
  });

  it('should list all files under the root', async () => {
    try {
      const files = await getFileChildren(ROOTID);
      if (is.not.array(files)) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    }
  });

  it('should create a test folder under the root', async () => {
    try {
      const testUser = await createUser({
        email: 'guo.ke.ke.a.test@gmail.com',
        password: 'test',
      });
      const theTestFolder = await createFile({
        name: 'test',
        type: FILETYPE.d,
        mode: '755',
        force: true,
        linkTo: '',
        parentId: ROOTID,
      });

      testUser.destroy();
      if (!theTestFolder) throw ERR_TASK_FAILED;
      if (theTestFolder.get('type') !== FILETYPE.d) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    }
  });

  it('should create a file under test named test', async () => {
    try {
      const theTestFile = await findOneFolderByName('test', ROOTID);
      const newFile = await createFile({
        name: 'test',
        parentId: theTestFile.get('id'),
        type: FILETYPE.f,
        mode: '755',
        linkTo: LINKTO.article,
      });

      if (!newFile) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    }
  });

  it('should get all files name is test', async () => {
    try {
      const files = await searchFilesByName('test');
      if (!files || files.length !== 3) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    }
  });

});
