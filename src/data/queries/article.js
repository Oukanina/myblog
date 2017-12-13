import fs from 'fs';
import {
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
  GraphQLString as String,
} from 'graphql';
import ArticleType, { ArticleList } from '../types/ArticleType';
import FileType from '../types/FileType';
import { dataDir } from '../../config.js';
import { File, User, FILETYPE } from '../models';
import * as fileUtils from '../utils/fileUtils';


function readFile(name) {
  return new Promise((resolve, reject) => {
    fs.readFile(`${dataDir}/${name}.md`, (err, data) => {
      if (err) return reject(err);
      return resolve(data);
    });
  });
}


export const articleList = {
  type: ArticleList,

  args: {
    id: {
      name: 'id',
      type: ID,
    },
  },

  async resolve(_, { id }) {
    let files;
    if (id) {
      files = await (await User.findOne({
        where: { id },
      })).getSubFile();
    } else {
      files = await File.findAll({
        attributes: ['id', 'name', 'owner.email', 'onCreate'],
        where: {
          linkTo: 'article',
        },
        include: [{
          attributes: ['email'],
          model: User,
          as: 'owner',
          required: true,
          // where: { id: col('file.userId') },
        }],
      });
    }

    const articles = files.map(file => ({
      id: file.id,
      name: file.name,
      owner: file.owner.email,
      onCreate: file.onCreate,
    }));

    return { articles };
  },
};

export const read = {
  type: FileType,

  args: {
    path: {
      name: 'path',
      type: new NonNull(String),
    },
  },

  async resolve(_, { path }) {
    try {
      if (!path) throw new Error('no path parameter when call article resolve!');

      const file = await fileUtils.getFileByPath(path);

      if (!file) {
        throw fileUtils.ERR_FILE_NOT_EXIST;
      }
      if (file.type === FILETYPE.d) {
        throw new Error(`${file.get('name')} is a directory!`);
      }

      return {
        id: file.getArticle().get('id'),
      };
    } catch (err) {
      console.error(err); // eslint-disable-line
      return {
        error: err,
      };
    }
  },
};

const article = {
  type: ArticleType,

  args: {
    id: {
      name: 'id',
      type: new NonNull(ID),
    },
  },

  async resolve(_, { id }) { // eslint-disable-line
    try {
      if (!id) throw new Error('no id parameter when call article resolve!');
      const content = await readFile(id);
      return {
        content,
      };
    } catch (err) {
      console.error(err); // eslint-disable-line
      return {
        error: err,
      };
    }
  },

};

export default article;
