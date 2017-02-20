"use strict";
var _this = this;
var tslib_1 = require("tslib");
var result_1 = require("../types/result");
var mosca_1 = require("../../mosca");
exports.LogoutQuery = {
    type: result_1.ResultType,
    args: {},
    resolve: function (root, b, req) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
        var mosca;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mosca = root.get(mosca_1.Mosca);
                    return [4 /*yield*/, mosca.publish({ topic: 'test', payload: 'hello this is a test' })];
                case 1:
                    _a.sent();
                    req.logout();
                    return [2 /*return*/, { result: true }];
            }
        });
    }); }
};
