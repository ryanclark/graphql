import * as bookshelf from 'bookshelf';
import * as knex from 'knex';

export const DB_STRING = 'postgres://localhost:5432/ultimate';

const db = bookshelf(knex(DB_STRING));

export const Model = db.Model;
