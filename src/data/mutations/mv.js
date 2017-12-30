import _path from 'path';
import {
  GraphQLNonNull as NonNull,
  GraphQLString as String,
} from 'graphql';
import FileType from '../types/FileType';
import { mv } from '../utils/fileUtils';

export default {
  type: FileType,
  description: 'move a file',
  args: {
    paths: {
      name: 'paths',
      type: new NonNull(String),
    },
  },
  async resolve(_, { paths }) {
    try {
      const targets = paths.split(',');
      const target = targets.pop();

      return await mv({
        files: targets.map(p => _path.resolve(p)),
        target: _path.resolve(target),
      });
    } catch (error) {
      console.error(error); // eslint-disable-line
      return {
        error,
      };
    }
  },
};
