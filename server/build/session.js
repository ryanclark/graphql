"use strict";
var tslib_1 = require("tslib");
var passport = require("passport");
var graphql = require("express-graphql");
var redis = require("connect-redis");
var session = require("express-session");
var bcryptjs_1 = require("bcryptjs");
var injection_js_1 = require("injection-js");
var passport_local_1 = require("passport-local");
var user_1 = require("./models/user");
var schema_1 = require("./graph/schema");
var REDIS_STORE_URL = '//127.0.0.1:6379';
var REDIS_STORE_SECRET = 'rY4nuLt1mAt3AnGuL4Rt0DD';
var Session = (function () {
    function Session(injector) {
        this.injector = injector;
    }
    Session.prototype.bootstrap = function (app) {
        var _this = this;
        var redisStore = redis(session);
        var config = {
            store: new redisStore({
                url: REDIS_STORE_URL
            }),
            secret: REDIS_STORE_SECRET,
            resave: false,
            saveUninitialized: false
        };
        app.use(session(config));
        app.use(passport.initialize());
        app.use(passport.session());
        passport.use(this.setupStrategy());
        passport.serializeUser(function (user, done) {
            done(null, user.id);
        });
        passport.deserializeUser(function (id, done) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var user, err_1;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, new user_1.User().where('id', id).fetch()];
                    case 1:
                        user = _a.sent();
                        done(null, user.toJSON());
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        done(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
        app.use('/graphql', graphql({
            schema: schema_1.schema,
            graphiql: process.env.NODE_ENV === 'development',
            rootValue: this.injector
        }));
    };
    Session.prototype.setupStrategy = function () {
        var _this = this;
        return new passport_local_1.Strategy({ usernameField: 'email', passwordField: 'password' }, function (email, password, done) { return tslib_1.__awaiter(_this, void 0, void 0, function () {
            var user, hash_1, correct, err_2;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, new user_1.User().where('email', email).fetch()];
                    case 1:
                        user = _a.sent();
                        if (!user) return [3 /*break*/, 3];
                        hash_1 = user.get('password');
                        return [4 /*yield*/, bcryptjs_1.compare(password, hash_1)];
                    case 2:
                        correct = _a.sent();
                        if (correct) {
                            return [2 /*return*/, done(null, user.toJSON())];
                        }
                        return [2 /*return*/, done(null, false)];
                    case 3: return [2 /*return*/, done(null, false)];
                    case 4:
                        err_2 = _a.sent();
                        done(err_2);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    };
    Session.prototype.password = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var salt, pw;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcryptjs_1.genSalt(10)];
                    case 1:
                        salt = _a.sent();
                        return [4 /*yield*/, bcryptjs_1.hash('test123', salt)];
                    case 2:
                        pw = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Session;
}());
Session = tslib_1.__decorate([
    injection_js_1.Injectable(),
    tslib_1.__metadata("design:paramtypes", [injection_js_1.Injector])
], Session);
exports.Session = Session;
