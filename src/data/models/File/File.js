import DataType from 'sequelize';
import Model from '../../sequelize';

export const FILETYPE = {
  f: 'f',
  d: 'd',
};

export const LINKTO = {
  article: 'article',
  music: 'music',
  video: 'video',
  none: 'none',
};

export const ROOTID = '0b2ec450-2cb0-11e7-84bc-b71a5a037f88';

const File = Model.define('File', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  type: {
    type: DataType.ENUM(FILETYPE.f, FILETYPE.d),
    allowNull: false,
  },

  name: {
    type: DataType.STRING(255),
    allowNull: false,
  },

  mode: {
    type: DataType.STRING(3),
    allowNull: false,
  },

  linkTo: {
    type: DataType.ENUM(LINKTO.article, LINKTO.music, LINKTO.video, LINKTO.none),
    allowNull: false,
  },

  onCreate: {
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  },

  path: {
    type: DataType.STRING(255 * 25),
    allowNull: false,
  },

}, {

  indexs: [
    { fields: ['id', 'name', 'path', 'linkTo'] },
  ],

});

export default File;
