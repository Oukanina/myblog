import DataType from 'sequelize';
import Model from '../../sequelize';

const Article = Model.define('Article', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  path: {
    type: DataType.STRING(255),
    allowNull: false,
  },

  timestamps: true,

}, {

  indexes: [
    { fields: ['id'] },
  ],

});

export default Article;
