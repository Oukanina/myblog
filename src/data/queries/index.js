import {
  GraphQLObjectType as ObjectType,
} from 'graphql';
import me from './me';
import file, { ls } from './file';
import news from './news';
import article, { articleList, read } from './article';

const queryType = new ObjectType({
  name: 'Query',
  fields: {
    me,
    ls,
    news,
    file,
    article,
    articleList,
    read,
  },
});

export default queryType;
