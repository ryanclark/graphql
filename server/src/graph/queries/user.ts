import { GraphQLID, GraphQLList, GraphQLNonNull, GraphQLResolveInfo } from 'graphql';

import { getSelections } from '../utils';
import { UserType } from '../types/user';
import { User } from '../../models/user';

export const UserQuery = {
  type: UserType,
  args: {
    id: {
      name: 'id',
      type: new GraphQLNonNull(GraphQLID)
    }
  },
  resolve: async (root: any, params: any, _: any, info: GraphQLResolveInfo) => {
    const columns = getSelections(info.fieldNodes[0]);
    const user = await new User().where(params).fetch({ columns });
    return user.toJSON();
  }
};

export const UsersQuery = {
  type: new GraphQLList(UserType),
  args: {},
  resolve: async (root: any, params: any, _: any, info: GraphQLResolveInfo) => {
    const columns = getSelections(info.fieldNodes[0]);
    const user = await new User().query((qb) => qb.columns(columns)).fetchAll();
    return user.toJSON();
  }
};
