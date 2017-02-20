import { Request } from 'express';

import { UserType } from '../types/user';

export const MeQuery = {
  type: UserType,
  args: {},
  resolve: (_: any, params: any, req: Request) => {
    return req.user;
  }
};
