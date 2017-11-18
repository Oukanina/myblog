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
  },
  async resolve(_, { path }) {
    try {
      let filePath = path;

      if (!filePath) {
        return { };
      }
      if (path.indexOf('~') > -1) {
        filePath = path.replace('~', _.request.user.HOME);
      }
      // if (/^\//.test(filePath)) {
      //
      // } else if (/^\.\//.test(filePath)) {
      //   filePath = _path.resolve(_.request.user.path, filePath);
      // } else {
      // }
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
        return await rm(filePath, true);
      } else { // eslint-disable-line
        return await rm(filePath);
      }
    } catch (error) {
      console.error(error); // eslint-disable-line
      return {
        error,
      };
    }
  },
};
