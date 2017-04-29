import DataType from 'sequelize';
import Model from '../../sequelize';

const UserGroup = Model.define('UserGroup', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  name: {
    type: DataType.STRING(255),
    allowNull: false,
  },

});

export default UserGroup;
