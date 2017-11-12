import {
  GraphQLNonNull as NonNull,
  GraphQLString as String,
} from 'graphql';
import FileType from '../types/FileType';
import { mkdir } from '../utils/fileUtils';

export default {
  type: FileType,
  description: 'Create a new directory',
  args: {
    name: {
      name: 'name',
      type: new NonNull(String),
    },
    path: {
      name: 'path',
      type: new NonNull(String),
    },
  },
  async resolve(_, { name, path }) {
    try {
      return await mkdir({
        userId: _.request.user.id, name, path,
      });
    } catch (error) {
      console.error(error); // eslint-disable-line
      return {
        error,
      };
    }
  },
};
