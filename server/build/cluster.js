"use strict";
require("core-js/es7/reflect");
require("zone.js/dist/zone-node.js");
require("zone.js/dist/long-stack-trace-zone.js");
var cluster_1 = require("cluster");
var os_1 = require("os");
var injection_js_1 = require("injection-js");
var server_1 = require("./server");
var session_1 = require("./session");
var mosca_1 = require("./mosca");
if (cluster_1.isMaster && process.env.NODE_ENV === 'production') {
    for (var i = 0; i < os_1.cpus().length; i++) {
        cluster_1.fork();
    }
    cluster_1.on('exit', function (worker) { return console.log("worker " + worker.process.pid + " died"); });
}
else {
    var injector = injection_js_1.ReflectiveInjector.resolveAndCreate([mosca_1.Mosca, server_1.Server, session_1.Session]);
    injector.get(server_1.Server);
    console.log("Worker " + process.pid + " started");
}
