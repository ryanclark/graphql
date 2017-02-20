import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  styleUrls: ['app-header.component.scss'],
  template: `
    <header class="header">
      <div class="wrapper">
        <a class="logo" routerLink="/">
          Ultimate Angular
          <img 
            class="logo__image"
            src="https://ultimateangular.com/assets/img/icons/logo.svg"
            alt="Ultimate Angular">
        </a>

        <div class="award">
          <a href="/about">
            <img src="https://ultimateangular.com/assets/img/award.svg" alt="">
            <p class="award__title">Angular Product of 2016</p>
            <p>
              Best Angular Product for Education
            </p>
          </a>
        </div>

        <nav class="nav">
          <ul 
            class="nav__list" 
            *ngIf="ready | async">
            <li class="nav__item">
              <a href="/courses" class="nav__link">
                Courses
              </a>
            </li>
            <ng-container *ngIf="(user | async) !== null; else elseBlock">
              <li class="nav__item">
                <a class="nav__link" (click)="logout()">
                  {{ (user | async).first_name }}
                </a>
              </li>
            </ng-container>
            <template #elseBlock>
              <li class="nav__item">
                <a href="/login" class="nav__link" routerLink="/login">
                  Login
                </a>
              </li>
            </template>
          </ul>
        </nav>
      </div>
    </header>
  `
})
export class AppHeaderComponent {
  user = this.authService.user;
  ready = this.user.map((user) => user !== undefined);

  constructor(private authService: AuthService, private router: Router) {}

  logout() {
    this.authService.logout()
      .subscribe(() => this.router.navigate(['/login']));
  }
}
