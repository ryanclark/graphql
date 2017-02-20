"use strict";
var user_1 = require("../types/user");
exports.MeQuery = {
    type: user_1.UserType,
    args: {},
    resolve: function (_, params, req) {
        return req.user;
    }
};
