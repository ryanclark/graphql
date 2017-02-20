"use strict";
var tslib_1 = require("tslib");
var db_1 = require("../db");
var User = (function (_super) {
    tslib_1.__extends(User, _super);
    function User(attributes, options) {
        var _this = _super.call(this, attributes, options) || this;
        _this.tableName = 'user';
        return _this;
    }
    return User;
}(db_1.Model));
exports.User = User;
