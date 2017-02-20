import { Request } from 'express';
import { Injector } from 'injection-js';

import { ResultType } from '../types/result';
import { Mosca } from '../../mosca';

export const LogoutQuery = {
  type: ResultType,
  args: {},
  resolve: async (root: Injector, b: any, req: Request) => {
    const mosca = root.get(Mosca);
    await mosca.publish({ topic: 'test', payload: 'hello this is a test' });

    req.logout();
    return { result: true };
  }
};
