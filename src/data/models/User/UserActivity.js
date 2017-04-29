import DataType from 'sequelize';
import Model from '../../sequelize';

const UserActivity = Model.define('UserActivity', {

  last: {
    type: DataType.BOOLEAN,
    defaultValue: true,
  },

  lastLoginTime: {
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  },

  lastLoginIp: {
    type: DataType.STRING(40),
    allowNull: true,
  },

}, {

  indexs: [],

});


export default UserActivity;
