import { GraphQLResolveInfo } from 'graphql';

import { SubscriptionType } from '../types/subscription';

export const Subscription = {
  type: SubscriptionType,
  args: {},
  resolve: (root: any, params: any, _: any, info: GraphQLResolveInfo) => {
    return {
      token: root.session_token
    };
  }
};
