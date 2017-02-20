import { GraphQLSchema, GraphQLObjectType } from 'graphql';

import { LoginQuery } from './queries/login';
import { LogoutQuery } from './queries/logout';
import { MeQuery } from './queries/me';
import { Subscription } from './subscription/subscription';
import { UserQuery, UsersQuery } from './queries/user';
import { UsersSubscription } from './subscription/user';

export const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      login: LoginQuery,
      logout: LogoutQuery,
      me: MeQuery,
      user: UserQuery,
      users: UsersQuery
    }
  }),
  subscription: new GraphQLObjectType({
    name: 'Subscription',
    fields: {
      subscription: Subscription,
      users: UsersSubscription
    }
  })
});
