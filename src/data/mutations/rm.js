import _path from 'path';
import {
  GraphQLNonNull as NonNull,
  GraphQLString as String,
} from 'graphql';
import FileType from '../types/FileType';
import { rm, rmWithWildcard } from '../utils/fileUtils';

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
      const user = _.request.user;

      if (user.username !== 'root') {
        throw new Error('Only root can delete!');
      }

      const recurrence = options.includes('-r');
      let filePath = path;

      if (!filePath) {
        return { };
      }
      if (path.indexOf('~') > -1) {
        filePath = path.replace('~', _.request.user.HOME);
      }

      filePath = _path.resolve(filePath);

      if (/\*/.test(filePath)) {
        return await rmWithWildcard({
          path: filePath,
          recurrence,
        });
      }

      return await rm({
        path: filePath,
        recurrence,
      });
    } catch (error) {
      console.error(error); // eslint-disable-line
      return {
        error,
      };
    }
  },
};
