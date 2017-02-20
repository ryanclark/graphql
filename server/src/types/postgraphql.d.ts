declare module 'postgraphql' {
  import express = require('express');

  interface PostgraphOptions {
    jwtPgTypeIdentifier?: string,
    jwtSecret?: string,
    graphiql?: boolean,
    watchPg?: boolean
  }

  declare function postgraphql(url: string, options: PostgraphOptions): express.RequestHandler;
}
