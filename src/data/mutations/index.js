import {
  GraphQLObjectType as ObjectType,
} from 'graphql';
import mkdir from './mkdir';
import cd from './cd';
import rm from './rm';

const mutationType = new ObjectType({
  name: 'Mutation',
  fields: {
    cd,
    mkdir,
    rm,
  },
});

export default mutationType;
