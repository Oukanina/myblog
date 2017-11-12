
import {
  GraphQLObjectType as ObjectType,
  GraphQLID as ID,
  GraphQLList as ListType,
  GraphQLString as StringType,
  GraphQLBoolean as BooleanType,
  // GraphQLNonNull as NonNull,
} from 'graphql';


const FileType = new ObjectType({
  name: 'File',
  fields: () => ({
    id: { type: ID },
    name: { type: StringType },
    type: { type: StringType },
    children: { type: new ListType(FileType) },
    error: { type: StringType },
    null: { type: BooleanType },
  }),
});

export default FileType;
