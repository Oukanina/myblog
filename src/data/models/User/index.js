import User from './User';
import UserLogin from './UserLogin';
import UserClaim from './UserClaim';
import UserProfile from './UserProfile';
import UserActivity from './UserActivity';
import UserGroup from './UserGroup';
// eslint-disable-next-line
import Group from '../Group/Group';

User.hasMany(UserLogin, {
  foreignKey: 'userId',
  as: 'logins',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasMany(UserClaim, {
  foreignKey: 'userId',
  as: 'claims',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.hasMany(UserActivity, {
  foreignKey: 'userId',
  as: 'activity',
});

User.hasOne(UserProfile, {
  foreignKey: 'userId',
  as: 'profile',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

User.belongsToMany(Group, {
  foreignKey: 'userId',
  through: {
    model: UserGroup,
    unique: false,
  },
  constraints: false,
});

Group.belongsToMany(User, {
  foreignKey: 'groupId',
  through: {
    model: UserGroup,
    unique: false,
  },
  constraints: false,
});

export { User, UserLogin, UserClaim, UserProfile, UserActivity, UserGroup };
export default User;
