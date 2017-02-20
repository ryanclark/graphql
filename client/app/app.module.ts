import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Routes, RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { AngularQLModule } from 'angularql';

import { AppComponent } from './app.component';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth/auth.service';
import { AppHeaderComponent } from './components/app-header/app-header.component';
import { GraphService } from './services/graph/graph.service';

export const ROUTER_CONFIG: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: '', loadChildren: './containers/home/home.module#HomeModule' },
      { path: 'about', loadChildren: './containers/about/about.module#AboutModule' },
      { path: 'contact', loadChildren: './containers/contact/contact.module#ContactModule' }
    ]
  },
  { path: 'login', loadChildren: './containers/login/login.module#LoginModule' }
];

@NgModule({
  imports: [
    BrowserModule,
    RouterModule,
    HttpModule,
    AngularQLModule.forRoot({
      endpoint: '/graphql'
    }),
    RouterModule.forRoot(ROUTER_CONFIG)
  ],
  bootstrap: [
    AppComponent
  ],
  declarations: [
    AppComponent,
    AppHeaderComponent
  ],
  providers: [
    AuthGuard,
    AuthService,
    GraphService
  ]
})
export class AppModule {}
