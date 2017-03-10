import File, { FILETYPE, LINKTO, ROOTID } from './File';
import { Article } from '../Article';
import { User } from '../User';
import { Group } from '../Group';

File.hasMany(File, {
  foreignKey: 'parentId',
  as: 'subFile',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

File.hasOne(Article, {
  foreignKey: 'fileId',
  as: 'article',
  onUpdate: 'cascade',
  onDelete: 'cascade',
});

File.belongsTo(User, {
  foreignKey: 'userId',
  as: 'owner',
  onUpdate: 'cascade',
  // onDelete: 'cascade',
});

File.belongsTo(Group, {
  foreignKey: 'groupId',
  as: 'group',
  onUpdate: 'cascade',
  // onDelete: 'cascade',
});

export { File, FILETYPE, LINKTO, ROOTID };
