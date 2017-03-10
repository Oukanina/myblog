import DataType from 'sequelize';
import Model from '../../sequelize';

const Article = Model.define('Article', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  content: {
    type: DataType.TEXT,
    allowNull: false,
  },

  title: {
    type: DataType.STRING(255),
    allowNull: false,
  },

  timestamps: true,

}, {

  indexes: [
    { fields: ['id', 'title', 'content'] },
  ],

});

export default Article;
