import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { AboutComponent } from './about.component';

export const ROUTER_CONFIG: Routes = [
  { path: '', component: AboutComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTER_CONFIG)
  ],
  declarations: [
    AboutComponent
  ]
})
export class AboutModule {}
