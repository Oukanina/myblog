import Group from './Group';
import { User } from '../User';

Group.hasMany(User, {
  foreignKey: 'groupId',
  as: 'member',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

export { Group };
