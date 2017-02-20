"use strict";
var tslib_1 = require("tslib");
var injection_js_1 = require("injection-js");
var mosca_1 = require("mosca");
var redis = require("redis");
var Mosca = (function () {
    function Mosca() {
    }
    Mosca.prototype.bootstrap = function (server) {
        var backend = {
            type: 'redis',
            redis: redis,
            db: 12,
            port: 6379,
            return_buffers: true,
            host: 'localhost'
        };
        var config = {
            backend: backend,
            persistence: {
                factory: mosca_1.persistence.Redis
            }
        };
        this.server = new mosca_1.Server(config);
        this.server.attachHttpServer(server);
        this.server.on('ready', function () {
            console.log('Mosca server is up and running');
        });
        this.server.on('clientConnected', function (client) {
            console.log('client connected', client.id);
        });
        this.server.on('published', function (packet, client) {
            console.log('Published', packet.topic, packet.payload);
        });
    };
    Mosca.prototype.publish = function (message) {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var _this = this;
            return tslib_1.__generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return _this.server.publish(message, resolve); })];
            });
        });
    };
    return Mosca;
}());
Mosca = tslib_1.__decorate([
    injection_js_1.Injectable()
], Mosca);
exports.Mosca = Mosca;
