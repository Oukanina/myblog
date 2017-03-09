import DataType from 'sequelize';
import Model from '../../sequelize';

const ArticleTag = Model.define('ArticleTag', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  name: {
    type: DataType.STRING(255),
    allowNull: false,
  },

}, {

  indexs: [
    { fields: ['name'] },
  ],

});

export default ArticleTag;
