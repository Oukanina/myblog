import _path from 'path';
import {
  GraphQLNonNull as NonNull,
  GraphQLString as String,
} from 'graphql';
import FileType from '../types/FileType';
import { rm } from '../utils/fileUtils';

export default {
  type: FileType,
  description: 'Remove a file',
  args: {
    path: {
      name: 'path',
      type: new NonNull(String),
    },
    options: {
      name: 'options',
      type: String,
    },
  },
  async resolve(_, { path, options = '' }) {
    try {
      let filePath = path;

      if (!filePath) {
        return { };
      }
      if (path.indexOf('~') > -1) {
        filePath = path.replace('~', _.request.user.HOME);
      }

      filePath = _path.resolve(filePath);

      if (
        !filePath ||
        filePath === '/' ||
        filePath === '/*' ||
        filePath === '/root'
      ) {
        return { };
      }

      if (/\*$/.test(filePath)) {
        filePath = _path.resolve(filePath.replace('*', ''));
      }

      return await rm(filePath, options.includes('-r'));
    } catch (error) {
      console.error(error); // eslint-disable-line
      return {
        error,
      };
    }
  },
};
