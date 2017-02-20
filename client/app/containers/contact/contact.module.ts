import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { ContactComponent } from './contact.component';

export const ROUTER_CONFIG: Routes = [
  { path: '', component: ContactComponent }
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(ROUTER_CONFIG)
  ],
  declarations: [
    ContactComponent
  ]
})
export class ContactModule {}
