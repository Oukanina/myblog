import { User, Group } from '../models';
import { fliterObject } from '../../core/utils';

export const ERR_EMAIL_ALREADY_EXISTS = new Error('this email already exists!');
export const ERR_USER_NOT_FOUND = new Error('user not found!');
export const ERR_USER_ALREADY_IN = new Error('user already in this group!');
export const ERR_GROUP_NOT_FOUND = new Error('group not found!');
export const ERR_USER_NOT_IN_GROUP = new Error('user not in the group');

export function getUserById(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = User.findOne({
        where: { id },
      });
      if (!user) throw ERR_USER_NOT_FOUND;
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
}

export function createUser({ email, password }) {
  return new Promise(async (resolve, reject) => {
    let newUser;
    try {
      const users = User.findAll({
        attributes: ['email'],
        where: { email },
      });
      if (users.length) throw ERR_EMAIL_ALREADY_EXISTS;
      newUser = User.create({
        email, password,
      });
      resolve(newUser);
    } catch (err) {
      if (newUser) newUser.destroy();
      reject(err);
    }
  });
}

export function setUserProfile({ id, displayName, gender, picture, website, location }) {
  return new Promise(async (resolve, reject) => {
    let newProfile;
    try {
      const user = await getUserById(id);
      const profile = await user.getProfile();
      if (!profile) {
        newProfile = await user.createProfile(fliterObject({
          displayName, gender, picture, website, location,
        }));
        resolve(newProfile);
        return;
      }
      newProfile = await profile.update(fliterObject({
        displayName, gender, picture, website, location,
      }));
      resolve(newProfile);
    } catch (err) {
      if (newProfile) newProfile.destroy();
      reject(err);
    }
  });
}

export function setUserGroup({ userId, groupId }) {
  return new Promise(async (resolve, reject) => {
    let group;
    let user;
    try {
      user = Group.findOne({
        where: { '$user.id$': userId, '$user.groupId$': groupId },
        include: [{
          atteribute: ['id', 'groupId'],
          model: User,
          as: 'user',
          required: true,
        }],
      });
      if (user) throw ERR_USER_ALREADY_IN;
      group = await Group.findOne({
        where: { id: groupId },
      });
      if (!group) throw ERR_GROUP_NOT_FOUND;
      user = await getUserById(userId);
      if (!user) throw ERR_USER_NOT_FOUND;
      resolve(await group.addMember(user));
    } catch (err) {
      if (err !== ERR_USER_ALREADY_IN) {
        if (await group.hasMember(user)) {
          group.removeMember(user);
        }
      }
      reject(err);
    }
  });
}

export function removeUserGroup({ userId, groupId }) {
  return new Promise(async (resolve, reject) => {
    let group;
    let user;
    try {
      group = await Group.findOne({
        where: { id: groupId },
      });
      if (!group) throw ERR_GROUP_NOT_FOUND;
      user = await getUserById(userId);
      if (!await group.hasMember(user)) throw ERR_USER_NOT_IN_GROUP;
      resolve(await group.removeMember(user));
    } catch (err) {
      if (err !== ERR_USER_NOT_IN_GROUP) {
        if (!await group.hasMember(user)) {
          group.addMember(user);
        }
      }
      reject(err);
    }
  });
}

export function changePassword({ userId, newPassword }) {
  return new Promise(async (resolve, reject) => {
    try {
      let user = await getUserById(userId);
      user = await user.update({
        password: newPassword,
      });
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
}
