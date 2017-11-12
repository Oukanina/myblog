
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
  return {
    children: parent ? await parent.getSubFile() : [],
  };
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
      return subFile(await findFileByPath(path));
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
      const theFile = await findFileById(id);
      return {
        id: theFile.get('id'),
        name: theFile.get('name'),
      };
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
