import {
  GraphQLObjectType as ObjectType,
} from 'graphql';
import mkdir from './mkdir';
import cd from './cd';

const mutationType = new ObjectType({
  name: 'Mutation',
  fields: {
    cd,
    mkdir,
  },
});

export default mutationType;
