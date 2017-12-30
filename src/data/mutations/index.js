import {
  GraphQLObjectType as ObjectType,
} from 'graphql';
import mkdir from './mkdir';
import cd from './cd';
import rm from './rm';
import mv from './mv';

const mutationType = new ObjectType({
  name: 'Mutation',
  fields: {
    cd,
    mkdir,
    rm,
    mv,
  },
});

export default mutationType;
