import _path from 'path';
import {
  GraphQLNonNull as NonNull,
  GraphQLString as String,
} from 'graphql';
import { findFileByPath } from '../utils/fileUtils';
import FileType from '../types/FileType';
import { FILETYPE } from '../models';

export default {
  type: FileType,
  description: 'Create a new directory',
  args: {
    path: {
      name: 'path',
      type: new NonNull(String),
    },
  },
  async resolve(_, { path }) {
    try {
      let targetPath = '';

      if (targetPath.includes('~')) {
        targetPath = path.replace('~', _.request.user.home);
      } else {
        targetPath = path;
      }

      const file = await findFileByPath(
        _path.resolve(targetPath),
      );

      if (!file) {
        throw new Error(`wrong path:  ${targetPath}...`);
      }
      if (file.type === FILETYPE.f) {
        throw new Error(`${path} is not a directory...`);
      }

      return {
        id: file.get('id'),
        name: file.get('name'),
        type: file.get('type'),
        path: file.get('path'),
      };
    } catch (error) {
      console.error(error); // eslint-disable-line
      return {
        error,
      };
    }
  },
};
