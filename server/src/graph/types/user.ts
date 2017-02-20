import { GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID } from 'graphql';

export const UserType = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLID)
    },
    email: {
      type: GraphQLString
    },
    first_name: {
      type: GraphQLString
    },
    last_name: {
      type: GraphQLString
    },
    password: {
      type: GraphQLString
    },
    subscription_token: {
      type: GraphQLString
    }
  }
});
