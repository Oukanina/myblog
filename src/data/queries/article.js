
import fs from 'fs';
import {
  // GraphQLList as ListType,
  GraphQLNonNull as NonNull,
  GraphQLID as ID,
} from 'graphql';
import ArticleType, { ArticleList } from '../types/ArticleType';
import { dataDir } from '../../config.js';
import { File, User } from '../models';


function read(name) {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile(`${dataDir}/${name}.md`, (err, data) => {
        if (err) throw err;
        resolve(data);
      });
    } catch (err) {
      reject(err);
    }
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
      return {
        content: await read(id),
      };
    } catch (err) {
      console.error(err); // eslint-disable-line
    }
  },

};

export default article;
