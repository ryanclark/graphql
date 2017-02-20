"use strict";
var _this = this;
var tslib_1 = require("tslib");
var graphql_1 = require("graphql");
var utils_1 = require("../utils");
var user_1 = require("../types/user");
var user_2 = require("../../models/user");
exports.UserQuery = {
    type: user_1.UserType,
    args: {
        id: {
            name: 'id',
            type: new graphql_1.GraphQLNonNull(graphql_1.GraphQLID)
        }
    },
    resolve: function (root, params, _, info) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var columns, user;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    columns = utils_1.getSelections(info.fieldNodes[0]);
                    return [4 /*yield*/, new user_2.User().where(params).fetch({ columns: columns })];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, user.toJSON()];
            }
        });
    }); }
};
exports.UsersQuery = {
    type: new graphql_1.GraphQLList(user_1.UserType),
    args: {},
    resolve: function (root, params, _, info) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var columns, user;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    columns = utils_1.getSelections(info.fieldNodes[0]);
                    return [4 /*yield*/, new user_2.User().query(function (qb) { return qb.columns(columns); }).fetchAll()];
                case 1:
                    user = _a.sent();
                    return [2 /*return*/, user.toJSON()];
            }
        });
    }); }
};
