import * as cookie from 'cookie-parser';
import * as express from 'express';
import * as http from 'http';
import * as net from 'net';
import * as passport from 'passport';

import { json, urlencoded } from 'body-parser';
import { join } from 'path';
import { Injectable } from 'injection-js';

import { Session } from './session';
import { Mosca } from './mosca';

@Injectable()
export class Server {
  app: express.Express = express();
  server: net.Server;

  constructor(private session: Session, private mosca: Mosca) {
    this.server = http.createServer(this.app);
    this.server.listen(process.env.port || 3000);

    this.app.use(json());
    this.app.use(cookie());
    this.app.use(urlencoded({ extended: false }));
    this.app.disable('x-powered-by');

    console.log(`Listening on port ${process.env.port || 3000}`);

    this.session.bootstrap(this.app);
    this.mosca.bootstrap(this.server);
    this.routes();

    if (process.env.NODE_ENV === 'development') {
      // app.use('/graphql', graphql({
      //   schema: MyGraphQLSchema,
      //   graphiql: true
      // }));
    }
  }

  routes() {
    const login = (req: express.Request, res: express.Response, next: express.NextFunction) => {
      passport.authenticate('local', (err: any, user: any) => {
        console.log('USER', user);
        if (!user) {
          return res.json({error: true});
        }
        req.login(user, (err) => {
          if (err) {
            return res.json({error: true});
          }
          return res.json({error: false});
        });
      })(req, res, next);
    };

    this.app.post('/login', login);

    this.app.get('/logout', (req, res) => {
      req.logout();
      res.json({error: false});
    });

    this.app.use((req, res) => {
      res.sendFile(join(__dirname + '/../index.html'));
    });
  }
}
