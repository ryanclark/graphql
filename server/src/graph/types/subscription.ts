import { GraphQLObjectType, GraphQLString } from 'graphql';

export const SubscriptionType = new GraphQLObjectType({
  name: 'SubscriptionResponse',
  fields: {
    token: {
      type: GraphQLString
    }
  }
});
