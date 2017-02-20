import { GraphQLList, GraphQLResolveInfo, FieldNode } from 'graphql';

import { getSelections } from '../utils';
import { UserType } from '../types/user';
import { User } from '../../models/user';

export const UsersSubscription = {
  type: new GraphQLList(UserType),
  args: {},
  resolve: async (root: any, params: any, _: any, info: GraphQLResolveInfo) => {
    // const selections: FieldNode[] = [{
    //   kind: 'Field',
    //   alias: null,
    //   name: {
    //     kind: 'Name',
    //     value: 'last_name'
    //   },
    //   arguments: [],
    //   directives: [],
    //   selectionSet: null
    // }];
    //
    // info.fieldNodes.push({
    //   kind: 'Field',
    //   name: {
    //     kind: 'Name',
    //     value: 'id'
    //   },
    //   selectionSet: {
    //     kind: 'SelectionSet',
    //     selections
    //   }
    // });
    const columns = getSelections(info.fieldNodes[0]);

    root.session_token = 'test';

    // console.log(columns);
    const user = await new User().query((qb) => qb.columns(columns)).fetchAll();
    return user.toJSON();
  }
};
