import { getUserById, createUser, setUserProfile,
  ERR_EMAIL_ALREADY_EXISTS } from '../utils/userUtils';
import { ERR_TASK_FAILED } from './constants';

describe('User utils test: ', () => {

  it('should create a user', async () => {
    let testUser;
    try {
      testUser = await createUser({
        email: 'test@test.com',
        password: 'test',
      });
      const theUser = await getUserById(testUser.get('id'));
      if (!theUser) throw ERR_TASK_FAILED;
    } catch (err) {
      throw err;
    } finally {
      if (testUser) testUser.destroy();
    }
  });

  it('should throw a emial exist err', async () => {
    let testUser;
    try {
      testUser = await createUser({
        email: 'test@test.com',
        password: 'test',
      });
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
      testUser = await createUser({
        email: 'test@test.com',
        password: 'test',
      });
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
      if (testUser) testUser.destroy();
    }
  });

});
