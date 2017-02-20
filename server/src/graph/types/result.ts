import { GraphQLObjectType, GraphQLBoolean } from 'graphql';

export const ResultType = new GraphQLObjectType({
  name: 'Result',
  fields: {
    result: {
      type: GraphQLBoolean
    }
  }
});
