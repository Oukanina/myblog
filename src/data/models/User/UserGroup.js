import DataType from 'sequelize';
import Model from '../../sequelize';

const UserGroup = Model.define('UserGroup', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  userId: {
    type: DataType.UUID,
    allowNull: false,
  },

  groupId: {
    type: DataType.UUID,
    allowNull: false,
  },

});

export default UserGroup;
