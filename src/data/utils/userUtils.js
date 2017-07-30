import { User, UserLogin, UserProfile, LINKTO, ROOTID } from '../models';
import { fliterObject } from '../../core/utils';
import { createFolder } from './fileUtils';

export const ERR_EMAIL_ALREADY_EXISTS = new Error('this email already exists!');
export const ERR_USER_NOT_FOUND = new Error('user not found!');
export const ERR_USER_ALREADY_IN = new Error('user already in this group!');
export const ERR_GROUP_NOT_FOUND = new Error('group not found!');
export const ERR_USER_NOT_IN_GROUP = new Error('user not in the group');
export const ERR_USER_HAS_BEEN_DELETE = new Error('user has been delete');

export function getUserById(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await User.findOne({
        where: { id },
      });
      if (!user) throw ERR_USER_NOT_FOUND;
      if (user.get('onDelete')) throw ERR_USER_HAS_BEEN_DELETE;
      resolve(user);
    } catch (err) {
      reject(err);
    }
  });
}

export function createUser({ email, username, password }) {
  return new Promise(async (resolve, reject) => {
    let newUser;
    let userHome;
    try {
      const users = await User.findAll({
        // attributes: ['email'],
        where: { $or: {
          username, email,
        },
          onDelete: false },
      });
      if (users.length) throw ERR_EMAIL_ALREADY_EXISTS;
      newUser = await User.create({
        email, password, username: username || email,
      });
      // create user home folder
      const homeFolder = await createFolder({
        name: 'home',
        parentId: ROOTID,
        userId: newUser.get('id'),
        force: false,
        mode: '755',
        linkTo: LINKTO.none,
        createIfNotExist: true,
      });

      userHome = await createFolder({
        name: username || email,
        parentId: homeFolder.get('id'),
        userId: newUser.get('id'),
        force: false,
        mode: '755',
        linkTo: LINKTO.none,
        createIfNotExist: true,
      });
      resolve(newUser);
    } catch (err) {
      if (newUser) newUser.destroy();
      if (userHome) userHome.destroy();
      reject(err);
    }
  });
}

export function deleteUser(id) {
  return new Promise(async (resolve, reject) => {
    try {
      const user = await getUserById(id);
      await user.update({
        onDelete: true,
      });
      resolve();
    } catch (err) {
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

// export function setUserGroup({ userId, groupName }) {
//   return new Promise(async (resolve, reject) => {
//     let group;
//     let user;
//     try {
//       user = await Group.findOne({
//         where: { '$user.id$': userId, 'name': groupName },
//         include: [{
//           atteribute: ['id'],
//           model: User,
//           as: 'user',
//           required: true,
//         }],
//       });
//       if (user) throw ERR_USER_ALREADY_IN;
//       group = await Group.findOne({
//         where: { name: groupName },
//       });
//       if (!group) throw ERR_GROUP_NOT_FOUND;
//       user = await getUserById(userId);
//       if (!user) throw ERR_USER_NOT_FOUND;
//       console.log(group.addMember, group.addMembers);
//       await group.addMember(user);
//       resolve(true);
//     } catch (err) {
//       if (err !== ERR_USER_ALREADY_IN) {
//         if (group && await group.hasMember(user)) {
//           group.removeMember(user);
//         }
//       }
//       reject(err);
//     }
//   });
// }

// export function removeUserGroup({ userId, groupName }) {
//   return new Promise(async (resolve, reject) => {
//     let group;
//     let user;
//     try {
//       group = await Group.findOne({
//         where: { name: groupName },
//       });
//       if (!group) throw ERR_GROUP_NOT_FOUND;
//       user = await getUserById(userId);
//       if (!await group.hasMember(user)) throw ERR_USER_NOT_IN_GROUP;
//       resolve(await group.removeMember(user));
//     } catch (err) {
//       if (err !== ERR_USER_NOT_IN_GROUP) {
//         if (!await group.hasMember(user)) {
//           group.addMember(user);
//         }
//       }
//       reject(err);
//     }
//   });
// }

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

export function getUserByToken(token) {
  return User.findAll({
    attributes: ['id', 'email', 'profile.displayName'],
    where: {
      '$logins.name$': 'local:token',
      '$logins.key$': token,
      onDelete: false,
    },
    include: [{
      attributes: ['name', 'key'],
      model: UserLogin,
      as: 'logins',
      required: true,
    }, {
      attributes: ['displayName'],
      model: UserProfile,
      as: 'profile',
    }],
  });
}

// export function getUserByToken(token) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       // let user = await User.

//       resolve(user);
//     } catch(err) {
//       reject(err);
//     }
//   });
// }
