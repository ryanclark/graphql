declare module 'mosca' {
  import net = require('net');

  interface Ascoltatore {
  }

  interface MoscaHttp {
    port: number,
    bundle: string,
    static: boolean,
    stats: boolean
  }

  interface MoscaPersistence {
    (options?: any, callback: () => void): void;
  }

  interface MoscaSettings {
    port?: number,
    host?: string,
    backend?: Ascoltatore,
    ascoltatore?: Ascoltatore,
    maxInflightMessages?: number,
    logger?: {
      childOf: string
    },
    persistence?: {
      factory: MoscaPersistence
    },
    secure?: {
      port: number,
      keyPath: string,
      certPath: string,
    },
    allowNonSecure?: boolean,
    http?: MoscaHttp,
    https?: MoscaHttp
  }

  interface MoscaClient {
    id: number
  }

  enum QOS {
    Send,
    Persist,
    Read
  }

  interface MoscaMessage {
    topic: string,
    payload: any,
    qos?: QOS,
    retain?: boolean
  }

  interface MoscaPersistences {
    Redis: MoscaPersistence
  }

  declare var persistence: MoscaPersistences;

  declare class Server extends NodeJS.EventEmitter {
    constructor(settings?: MoscaSettings) {}

    attachHttpServer(server: net.Server) {}

    on(event: string, callback: (packet: MoscaMessage, client: MoscaClient) => void);
    on(event: string, callback: (client: MoscaClient) => void);

    publish(message: MoscaMessage, callback: () => void);
  }
}
