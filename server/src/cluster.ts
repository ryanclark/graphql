import 'core-js/es7/reflect';
import 'zone.js/dist/zone-node.js';
import 'zone.js/dist/long-stack-trace-zone.js';

import { fork, isMaster, on } from 'cluster';

import { cpus } from 'os';
import { ReflectiveInjector } from 'injection-js';

import { Server } from './server';
import { Session } from './session';
import { Mosca } from './mosca';

if (isMaster && process.env.NODE_ENV === 'production') {
  for (let i = 0; i < cpus().length; i++) {
    fork();
  }
  on('exit', (worker) => console.log(`worker ${worker.process.pid} died`));
} else {
  const injector = ReflectiveInjector.resolveAndCreate([Mosca, Server, Session]);
  injector.get(Server);

  console.log(`Worker ${process.pid} started`);
}
