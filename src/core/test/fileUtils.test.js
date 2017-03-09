import is from 'is_js';
import { FILETYPE, LINKTO, ROOTID } from '../../data/models';
import {
  createFile, findOneFileByName, getFileChildren, findOneFolderByName,
  searchFilesByName,
  ERR_FILE_ALREADY_EXIST, ERR_FILE_NOT_EXIST } from '../fileUtils';

const ERR_TASK_FAILED = new Error('Task failed!');

describe('createFile', () => {

  it('should create a file', () => createFile({
    name: 'test',
    type: FILETYPE.f,
    parentId: ROOTID,
    mode: '755',
    linkTo: LINKTO.article,
    force: true,
  })
    .then((file) => { if (!file) throw ERR_TASK_FAILED; })
    .catch((err) => { throw err; }));

  it('should thorw a error for file exist!', () => createFile({
    name: 'test',
    type: FILETYPE.f,
    parentId: ROOTID,
    mode: '755',
    linkTo: LINKTO.article,
  })
    .catch((err) => {
      if (err !== ERR_FILE_ALREADY_EXIST) throw err;
    }));

  it('should throw a error for file not exist!', () => createFile({
    name: 'test',
    type: FILETYPE.f,
    parentId: 'lalalalalala',
    mode: '755',
    linkTo: LINKTO.article,
  })
    .catch((err) => {
      if (err !== ERR_FILE_NOT_EXIST) throw err;
    }));

  const fileName = `test_${Date.now().toString()}`;
  it(`should crate a file named ${fileName}`, () => createFile({
    name: fileName,
    type: FILETYPE.f,
    parentId: ROOTID,
    mode: '755',
    linkTo: LINKTO.article,
  })
    .then(async () => {
      const file = await findOneFileByName(fileName, ROOTID);
      if (file.get('name') !== fileName) throw ERR_TASK_FAILED;
    })
    .catch((err) => {
      throw err;
    }));

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
      const theTestFolder = await createFile({
        name: 'test',
        type: FILETYPE.d,
        mode: '755',
        force: true,
        linkTo: '',
        parentId: ROOTID,
      });
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
