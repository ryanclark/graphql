"use strict";
var tslib_1 = require("tslib");
var cookie = require("cookie-parser");
var express = require("express");
var http = require("http");
var passport = require("passport");
var body_parser_1 = require("body-parser");
var path_1 = require("path");
var injection_js_1 = require("injection-js");
var session_1 = require("./session");
var mosca_1 = require("./mosca");
var Server = (function () {
    function Server(session, mosca) {
        this.session = session;
        this.mosca = mosca;
        this.app = express();
        this.server = http.createServer(this.app);
        this.server.listen(process.env.port || 3000);
        this.app.use(body_parser_1.json());
        this.app.use(cookie());
        this.app.use(body_parser_1.urlencoded({ extended: false }));
        this.app.disable('x-powered-by');
        console.log("Listening on port " + (process.env.port || 3000));
        this.session.bootstrap(this.app);
        this.mosca.bootstrap(this.server);
        this.routes();
        if (process.env.NODE_ENV === 'development') {
        }
    }
    Server.prototype.routes = function () {
        var login = function (req, res, next) {
            passport.authenticate('local', function (err, user) {
                console.log('USER', user);
                if (!user) {
                    return res.json({ error: true });
                }
                req.login(user, function (err) {
                    if (err) {
                        return res.json({ error: true });
                    }
                    return res.json({ error: false });
                });
            })(req, res, next);
        };
        this.app.post('/login', login);
        this.app.get('/logout', function (req, res) {
            req.logout();
            res.json({ error: false });
        });
        this.app.use(function (req, res) {
            res.sendFile(path_1.join(__dirname + '/../index.html'));
        });
    };
    return Server;
}());
Server = tslib_1.__decorate([
    injection_js_1.Injectable(),
    tslib_1.__metadata("design:paramtypes", [session_1.Session, mosca_1.Mosca])
], Server);
exports.Server = Server;
