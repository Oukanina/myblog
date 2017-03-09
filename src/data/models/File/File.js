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
};

export const ROOTID = 0;

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
    type: DataType.ENUM(LINKTO.article, LINKTO.music, LINKTO.video),
    allowNull: false,
  },

  underRoot: {
    type: DataType.BOOLEAN,
    defaultValue: false,
    allowNull: false,
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
