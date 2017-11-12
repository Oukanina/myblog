import {
  GraphQLObjectType as ObjectType,
} from 'graphql';
import mkdir from './mkdir';

const mutationType = new ObjectType({
  name: 'Mutation',
  fields: {
    mkdir,
  },
});

export default mutationType;
