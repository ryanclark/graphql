"use strict";
var _this = this;
var tslib_1 = require("tslib");
var bcryptjs_1 = require("bcryptjs");
var graphql_1 = require("graphql");
var utils_1 = require("../utils");
var user_1 = require("../types/user");
var user_2 = require("../../models/user");
var mosca_1 = require("../../mosca");
exports.LoginQuery = {
    type: user_1.UserType,
    args: {
        email: {
            name: 'email',
            type: graphql_1.GraphQLString
        },
        password: {
            name: 'password',
            type: graphql_1.GraphQLString
        }
    },
    resolve: function (root, params, req, info) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var columns, user, mosca, hash;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    columns = utils_1.getSelections(info.fieldNodes[0]).concat(['password']);
                    return [4 /*yield*/, new user_2.User().where('email', params.email).fetch({ columns: columns })];
                case 1:
                    user = _a.sent();
                    mosca = root.get(mosca_1.Mosca);
                    if (!user) return [3 /*break*/, 5];
                    hash = user.get('password');
                    return [4 /*yield*/, bcryptjs_1.compare(params.password, hash)];
                case 2:
                    if (!_a.sent()) return [3 /*break*/, 5];
                    return [4 /*yield*/, mosca.publish({ topic: 'mqtt/demo', payload: 'hello there!' })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, new Promise(function (resolve, reject) {
                            req.login(user.toJSON(), function (err) {
                                if (err) {
                                    reject(err);
                                }
                                resolve(user.toJSON());
                            });
                        })];
                case 4: return [2 /*return*/, _a.sent()];
                case 5: throw new Error('Login failed');
            }
        });
    }); }
};
