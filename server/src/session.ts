import * as passport from 'passport';
import * as graphql from 'express-graphql';
import * as redis from 'connect-redis';
import * as session from 'express-session';

import { compare, genSalt, hash } from 'bcryptjs';
import { Injectable, Injector } from 'injection-js';

import { Express } from 'express';
import { Strategy } from 'passport-local';
import { User } from './models/user';
import { schema } from './graph/schema';

const REDIS_STORE_URL = '//127.0.0.1:6379';
const REDIS_STORE_SECRET = 'rY4nuLt1mAt3AnGuL4Rt0DD';

@Injectable()
export class Session {
  constructor(private injector: Injector) {}

  bootstrap(app: Express) {
    const redisStore = redis(session);
    const config = {
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

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      try {
        const user = await new User().where('id', id).fetch();
        done(null, user.toJSON());
      } catch (err) {
        done(err);
      }
    });

    app.use('/graphql', graphql({
      schema,
      graphiql: process.env.NODE_ENV === 'development',
      rootValue: this.injector
    }));
  }

  setupStrategy() {
    return new Strategy({ usernameField: 'email', passwordField: 'password' }, async (email, password, done) => {
      try {
        const user = await new User().where('email', email).fetch();
        if (user) {
          const hash = user.get('password');
          const correct = await compare(password, hash);
          if (correct) {
            return done(null, user.toJSON());
          }
          return done(null, false);
        }
        return done(null, false);
      } catch (err) {
        done(err);
      }
    });
  }

  async password() {
    const salt = await genSalt(10);
    const pw = await hash('test123', salt);
  }
}
