import { Injectable } from '@angular/core';
import { Http } from '@angular/http';

import { connect } from 'mqtt';
import { Observable } from 'rxjs';

import { Node } from './node';
import { Parser } from './parser';
import { print } from './printer';
import { Field, Name, OperationDefinition, SelectionSet } from './interfaces';
import { Kind } from './types';

export interface QueryParams {
  [prop: string]: string
}

@Injectable()
export class GraphService {
  client = connect('mqtt://localhost:3000');

  constructor(private http: Http) {}

  query<T>(query: string, variables?: QueryParams): Observable<T> {
    const parser = new Parser(query.trim());
    const original = query;

    const ast = parser.parse();
    const definition = (ast.definitions[0] as OperationDefinition);
    const isSubscription = definition.operation === 'subscription';

    if (isSubscription) {
      const subscriptionSelection = new Node(Kind.Field) as Field;
      subscriptionSelection.name = new Node(Kind.Name) as Name;
      subscriptionSelection.name.value = 'token';

      const selection = new Node(Kind.Field) as Field;
      selection.name = new Node(Kind.Name) as Name;
      selection.name.value = 'subscription';
      selection.selectionSet = new Node(Kind.SelectionSet) as SelectionSet;
      selection.selectionSet.selections = [subscriptionSelection];

      definition.selectionSet.selections.push(selection);

      query = print(ast);
    }

    return this.http
      .post('/graphql', { query, variables })
      .map((res) => res.json())
      .map((query) => {
        if (!query.errors) {
          if (isSubscription) {
            const token = query.data.subscription.token;

            delete query.data.subscription;

            this.client.subscribe(token);

            this.client.on('message', (topic, payload) => {
              console.log([topic, payload].join(': '));
              this.client.end();
            });
          }
          return query.data;
        }
        throw query.errors.map((error) => error.message);
      });
  }
}
