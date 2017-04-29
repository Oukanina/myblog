
import DataType from 'sequelize';
import Model from '../../sequelize';

const Blog = Model.define('Blog', {

  id: {
    type: DataType.UUID,
    defaultValue: DataType.UUIDV1,
    primaryKey: true,
  },

  isInitial: {
    type: DataType.BOOLEAN,
    defaultValue: false,
  },

});

export default Blog;
