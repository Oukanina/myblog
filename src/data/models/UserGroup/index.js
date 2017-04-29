import UserGroup from './UserGroup';
import { User } from '../User';

UserGroup.hasMany(User, {
  foreignKey: 'groupId',
  as: 'member',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export { UserGroup };
