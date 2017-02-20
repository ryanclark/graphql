import { Component, OnInit } from '@angular/core';
import { connect } from 'mqtt';

import { GraphService } from './services/graph/graph.service';

@Component({
  selector: 'app-root',
  styleUrls: ['app.component.scss'],
  template: `
    <app-header></app-header>
    <router-outlet></router-outlet>
  `
})
export class AppComponent implements OnInit {
  constructor(private graphService: GraphService) {}

  ngOnInit() {
    this.graphService.query(`
      subscription {
        users {
          first_name
          last_name
        }
      }
    `).subscribe((res) => {
        console.log(res);
      });
    // const client = connect('mqtt://localhost:3000');
    //
    // client.subscribe('mqtt/demo');
    //
    // client.on('message', function(topic, payload) {
    //   console.log([topic, payload].join(': '));
    //   client.end();
    // });
  }
}
