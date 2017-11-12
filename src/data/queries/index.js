import {
  GraphQLObjectType as ObjectType,
} from 'graphql';
import me from './me';
import file, { ls } from './file';
import news from './news';
import article, { articleList } from './article';

const queryType = new ObjectType({
  name: 'Query',
  fields: {
    me,
    ls,
    news,
    file,
    article,
    articleList,
  },
});

export default queryType;
