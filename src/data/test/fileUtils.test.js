import is from 'is_js';
import { FILETYPE, LINKTO, ROOTID } from '../models';
import { createFile, findOneFileByName, getFileChildren,
  ERR_FILE_ALREADY_EXIST, ERR_FILE_NOT_EXIST } from '../utils/fileUtils';
import { createUser, deleteUserForever } from '../utils/userUtils';

const ERR_TASK_FAILED = new Error('Task failed!');

function createTestUser() {
  return createUser({
    name: 'test',
    password: 'test',
    email: 'guo.ke.ke.a.test@gmail.com',
  });
}

describe('File utils test: ', () => {

  it('should create a file', async () => {
    let testUser;
    let testFile;
    try {
      testUser = await createTestUser();
      testFile = await createFile({
        user: testUser,
        name: 'test',
        type: FILETYPE.f,
        parentId: ROOTID,
        mode: '755',
        linkTo: LINKTO.article,
        force: true,
      });
      if (!testFile) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) await deleteUserForever(testUser);
      if (testFile) await testFile.destroy();
    }
  });

  it('should thorw a error for file exist!', async () => {
    let testUser;
    let testFile;
    try {
      testUser = await createTestUser();
      testFile = await createFile({
        user: testUser,
        name: 'test',
        type: FILETYPE.f,
        parentId: ROOTID,
        mode: '755',
        linkTo: LINKTO.article,
      });
    } catch (err) {
      if (err !== ERR_FILE_ALREADY_EXIST) throw err;
    } finally {
      if (testFile) await testFile.destroy();
      if (testUser) await deleteUserForever(testUser);
    }
  });

  it('should throw a error for file not exist!', async () => {
    let testUser;
    let testFile;
    try {
      testUser = await createTestUser();
      testFile = await createFile({
        user: testUser,
        name: 'test',
        type: FILETYPE.f,
        parentId: 'lalalalalala',
        mode: '755',
        linkTo: LINKTO.article,
      });
    } catch (err) {
      if (err !== ERR_FILE_NOT_EXIST) throw err;
    } finally {
      if (testUser) await deleteUserForever(testUser);
      if (testFile) await testFile.destroy();
    }
  });

  const fileName = `test_${Date.now().toString()}`;
  it(`should crate a file named ${fileName}`, async () => {
    let testUser;
    let testFile;
    try {
      testUser = await createTestUser();
      await createFile({
        name: fileName,
        user: testUser,
        type: FILETYPE.f,
        parentId: ROOTID,
        mode: '755',
        linkTo: LINKTO.article,
      });
      testFile = await findOneFileByName(fileName, ROOTID);
      if (testFile.get('name') !== fileName) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) await deleteUserForever(testUser);
      if (testFile) await testFile.destroy();
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
    let testUser;
    let testFolder;
    try {
      testUser = await createTestUser();
      testFolder = await createFile({
        name: 'test',
        user: testUser,
        type: FILETYPE.d,
        mode: '755',
        force: true,
        linkTo: LINKTO.article,
        parentId: ROOTID,
      });

      if (!testFolder) throw ERR_TASK_FAILED;
      if (testFolder.get('type') !== FILETYPE.d) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) await deleteUserForever(testUser);
      if (testFolder) await testFolder.destroy();
    }
  });

  it('should create a file under test named test', async () => {
    let testUser;
    let testFile;
    let testFolder;
    try {
      testUser = await createTestUser();
      testFolder = await createFile({
        name: 'test',
        user: testUser,
        type: FILETYPE.d,
        mode: '755',
        force: true,
        linkTo: LINKTO.none,
        parentId: ROOTID,
      });
      testFile = await createFile({
        name: 'test',
        user: testUser,
        parentFolder: testFolder,
        type: FILETYPE.f,
        mode: '755',
        linkTo: LINKTO.article,
      });
      if (!testFile) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) await deleteUserForever(testUser);
      if (testFile) await testFile.destroy();
      if (testFolder) await testFolder.destroy();
    }
  });

  // it('should get all files which name is test', async () => {
  //   try {
  //     const files = await searchFilesByName('test');
  //     if (!files || files.length !== 3) throw ERR_TASK_FAILED;
  //   } catch (err) {
  //     throw err;
  //   }
  // });

});
