/* eslint-disable consistent-return */

import { UserGroup as Group } from '../models';

export const ERR_USER_ALREADY_IN = new Error('user already in the group!');
export const ERR_GROUP_NOT_FOUND = new Error('group not found!');
export const ERR_USER_NOT_IN_GROUP = new Error('user not in the group');
export const ERR_GROUP_ALREEAD_EXIST = new Error('group already exists');


export function isGroupHasMember(group, user) {
  return new Promise(async (resolve, reject) => {
    try {
      resolve(await group.hasMember(user));
    } catch (err) {
      reject(err);
    }
  });
}

export function getGroupByName(name) {
  return new Promise(async (resolve, reject) => {
    try {
      const group = await Group.findOne({
        where: { name },
      });
      if (!group) throw ERR_GROUP_NOT_FOUND;
      resolve(group);
    } catch (err) {
      reject(err);
    }
  });
}

export function createGroup(name) {
  return new Promise(async (resolve, reject) => {
    try {
      let group;
      try {
        group = await getGroupByName(name);
      } catch (err) {
        if (err !== ERR_GROUP_NOT_FOUND) throw err;
      }
      if (group) throw ERR_GROUP_ALREEAD_EXIST;
      group = await Group.create({ name });
      resolve(group);
    } catch (err) {
      reject(err);
    }
  });
}

export function setUserGroup(user, group) {
  return new Promise(async (resolve, reject) => {
    try {
      if (await isGroupHasMember(group, user)) {
        throw ERR_USER_ALREADY_IN;
      }
      await group.addMember(user);
      resolve();
    } catch (err) {
      reject(err);
    }
  });
}

export function removeUserGroup(user, group) {
  return new Promise(async (resolve, reject) => {
    try {
      if (await isGroupHasMember(group, user)) {
        await group.removeMember(user);
        resolve();
      } else {
        throw ERR_USER_NOT_IN_GROUP;
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function getGroupUserCountByName(name) {
  return new Promise(async (resolve, reject) => {
    try {
      const group = await getGroupByName(name);
      resolve(await group.countMembers());
    } catch (err) {
      reject(err);
    }
  });
}
