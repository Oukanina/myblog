import {
  getUserById, createUser, setUserProfile,
  ERR_EMAIL_ALREADY_EXISTS } from '../utils/userUtils';
import { setUserGroup, createGroup } from '../utils/groupUtils';
import { ERR_TASK_FAILED } from './constants';

function createTestUser() {
  return createUser({
    email: 'test@test.com',
    password: 'test',
  });
}


describe('User utils test: ', () => {

  it('should create a user', async () => {
    let testUser;
    try {
      testUser = await createTestUser();
      const theUser = await getUserById(testUser.get('id'));
      if (!theUser) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) await testUser.destroy();
    }
  });

  it('should throw a email exist err', async () => {
    let testUser;
    try {
      testUser = await createTestUser();
      await createUser({
        email: 'test@test.com',
        password: 'test',
      });
    } catch (err) {
      if (err !== ERR_EMAIL_ALREADY_EXISTS) throw err;
    } finally {
      if (testUser) testUser.destroy();
    }
  });

  it('should set testUser displayName to test', async () => {
    let testUser;
    try {
      testUser = await createTestUser();
      await setUserProfile({
        id: testUser.get('id'),
        displayName: 'test',
      });
      const theUser = await getUserById(testUser.get('id'));
      const userProfile = await theUser.getProfile();
      if (userProfile.get('displayName') !== 'test') throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) await testUser.destroy();
    }
  });

  it('should set test user to test group', async () => {
    let testUser;
    let testGroup;
    try {
      testGroup = await createGroup('test');
      testUser = await createTestUser();
      await setUserGroup(testUser, testGroup);

      if (!await testGroup.hasMember(testUser)) {
        throw ERR_TASK_FAILED;
      }

    } catch (err) {
      throw err;
    } finally {
      if (testUser) await testUser.destroy();
      if (testGroup) await testGroup.destroy();
    }
  });

});
