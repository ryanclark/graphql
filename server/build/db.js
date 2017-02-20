"use strict";
var bookshelf = require("bookshelf");
var knex = require("knex");
exports.DB_STRING = 'postgres://localhost:5432/ultimate';
var db = bookshelf(knex(exports.DB_STRING));
exports.Model = db.Model;
