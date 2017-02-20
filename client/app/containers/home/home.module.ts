import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { HomeComponent } from './home.component';

export const ROUTER_CONFIG: Routes = [
  { path: '', component: HomeComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTER_CONFIG)
  ],
  declarations: [
    HomeComponent
  ]
})
export class HomeModule {}
