import _path from 'path';
import {
  GraphQLNonNull as NonNull,
  GraphQLString as String,
  GraphQLID as ID,
} from 'graphql';
import FileType from '../types/FileType';
import {
  findFileById,
  findFileByPath,
  ERR_FILE_NOT_EXIST,
} from '../utils/fileUtils';


async function subFile(parent) {
  const children = await parent.getSubFile();
  return parent ? children : [];
}


export const ls = {
  type: FileType,

  args: {
    path: {
      name: 'path',
      type: new NonNull(String),
    },
  },

  async resolve(_, { path }) { // eslint-disable-line consistent-return
    try {
      const file = await findFileByPath(_path.resolve(path));

      return {
        id: file.get('id'),
        name: file.get('name'),
        path: file.get('path'),
        type: file.get('type'),
        children: subFile(file),
      };
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      return {
        error,
      };
    }
  },
};

const file = {
  type: FileType,

  args: {
    id: {
      name: 'id',
      type: new NonNull(ID),
    },
  },

  async resolve(_, { id }) { // eslint-disable-line consistent-return
    try {
      return await findFileById(id);
    } catch (error) {
      console.error(error); // eslint-disable-line no-console
      return {
        null: error === ERR_FILE_NOT_EXIST,
        error,
      };
    }
  },

};

export default file;
