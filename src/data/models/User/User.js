/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import DataType from 'sequelize';
import Model from '../../sequelize';

const User = Model.define('User', {

  paranoid: true,

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  email: {
    type: DataType.STRING(255),
    validate: { isEmail: true },
  },

  emailConfirmed: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

  password: {
    type: DataType.STRING(255),
    defaultValue: false,
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

  indexes: [
    { fields: ['email'] },
  ],

});

export default User;
