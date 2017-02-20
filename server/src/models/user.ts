import { ModelOptions } from 'bookshelf';
import { Model } from '../db';

export class User extends Model<User> {
  tableName = 'user';

  constructor(attributes?: any, options?: ModelOptions) {
    super(attributes, options);
  }
}
