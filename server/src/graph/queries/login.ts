import { compare } from 'bcryptjs';
import { Request } from 'express';
import { GraphQLString, GraphQLResolveInfo } from 'graphql';
import { Injector } from 'injection-js';

import { getSelections } from '../utils';
import { UserType } from '../types/user';
import { User } from '../../models/user';
import { Mosca } from '../../mosca';

interface Login {
  email: string,
  password: string
}

export const LoginQuery = {
  type: UserType,
  args: {
    email: {
      name: 'email',
      type: GraphQLString
    },
    password: {
      name: 'password',
      type: GraphQLString
    }
  },
  resolve: async (root: Injector, params: Login, req: Request, info: GraphQLResolveInfo) => {
    const columns = [...getSelections(info.fieldNodes[0]), 'password'];
    const user = await new User().where('email', params.email).fetch({ columns });
    const mosca = root.get(Mosca);

    if (user) {
      const hash = user.get('password');
      if (await compare(params.password, hash)) {
        await mosca.publish({ topic: 'mqtt/demo', payload: 'hello there!'});
        return await new Promise((resolve, reject) => {
          req.login(user.toJSON(), (err) => {
            if (err) {
              reject(err);
            }
            resolve(user.toJSON());
          });
        });
      }
    }
    throw new Error('Login failed');
  }
};
