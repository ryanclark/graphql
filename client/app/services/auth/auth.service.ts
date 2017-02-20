import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { BehaviorSubject } from 'rxjs';

import { GraphService } from '../graph/graph.service';

interface MeQuery {
  me: User
}

interface LoginQuery {
  login: User
}

interface LogoutQuery {
  result: boolean
}

export interface User {
  id: number,
  first_name: string,
  last_name: string,
  email: string
}

const user$ = new BehaviorSubject<User>(undefined);

@Injectable()
export class AuthService {
  redirectUrl: string;
  user = user$.asObservable().filter((user) => user !== undefined);

  constructor(private http: Http, private graphService: GraphService) {
    this.getUser().subscribe((user) => user$.next(user));
  }

  getUser() {
    return this.graphService.query<MeQuery>(`
      {
        me { id, first_name, last_name, email }
      }
    `).map((result) => result.me);
  }

  login(email: string, password: string) {
    return this.graphService.query<LoginQuery>(`
      query ($e: String, $p: String) {
        login(email: $e, password: $p) {
          id, first_name, last_name, email
        }
      }
    `, {e: email, p: password})
      .map((result) => {
        user$.next(result.login);
        return result.login;
      });
  }

  logout() {
    return this.graphService.query<LogoutQuery>('{ logout { result } }')
      .map(({result}) => {
        user$.next(null);
        return result;
      });
  }
}
