
import {
  GraphQLID as ID,
  GraphQLNonNull as NonNull,
  GraphQLString as StringType,
  GraphQLList as ListType,
  GraphQLObjectType as ObjectType,
} from 'graphql';


const ArticleType = new ObjectType({
  name: 'Article',
  fields: {
    id: { type: new NonNull(ID) },
    content: { type: StringType },
  },
});


export const ArticleInfo = new ObjectType({
  name: 'ArticleInfo',
  fields: {
    id: { type: new NonNull(ID) },
    name: { type: StringType },
    onCreate: { type: StringType },
    owner: { type: StringType },
  },
});


export const ArticleList = new ObjectType({
  name: 'ArticleList',
  fields: {
    articles: { type: new ListType(ArticleInfo) },
  },
});


export default ArticleType;
