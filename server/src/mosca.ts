import { Injectable } from 'injection-js';
import * as net from 'net';
import { Server, persistence, MoscaClient, MoscaMessage } from 'mosca';
import * as redis from 'redis';

@Injectable()
export class Mosca {
  server: Server;

  bootstrap(server: net.Server) {
    const backend = {
      type: 'redis',
      redis,
      db: 12,
      port: 6379,
      return_buffers: true,
      host: 'localhost'
    };

    const config = {
      backend,
      persistence: {
        factory: persistence.Redis
      }
    };

    this.server = new Server(config);
    this.server.attachHttpServer(server);

    this.server.on('ready', () => {
      console.log('Mosca server is up and running')
    });

    this.server.on('clientConnected', (client: MoscaClient) => {
      console.log('client connected', client.id);
    });

    this.server.on('published', (packet, client) => {
      console.log('Published', packet.topic, packet.payload);
    });
  }

  async publish(message: MoscaMessage) {
    return new Promise((resolve) => this.server.publish(message, resolve));
  }
}
