import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';

@Component({
  template: `
    <div class="login-background">
      <div class="login-background__gradient">
        <div class="login-background__shields"></div>
      </div>
    </div>
    <div class="login">
      <h3 class="login__title">Login</h3>
      <form 
        class="login__form"
        [formGroup]="form"
        (ngSubmit)="login()">
        <div class="login__field">
          <input 
            formControlName="email"
            type="email" 
            placeholder="Email address" />
          <span 
            class="login__error"
            *ngIf="form.get('email').touched && form.get('email').errors">
            <ng-container *ngIf="form.get('email').errors.required">
              Field is required
            </ng-container>
            <ng-container 
              *ngIf="!form.get('email').errors.required && form.get('email').errors.email">
              Invalid email
            </ng-container>
          </span>
        </div>
        <div class="login__field">
          <input 
            formControlName="password"
            type="password" 
            placeholder="Password" />
          <span 
            class="login__error"
            *ngIf="form.get('password').touched && form.get('password').errors">
            Field is required
          </span>
        </div>
        
        <div class="login__button">
          <button 
            type="submit" 
            [disabled]="form.invalid || submitting">
            {{ submitting ? 'Logging in...' : 'Login' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['login.component.scss']
})
export class LoginComponent {
  form = this.builder.group({
    email: ['ryan@ryanclark.me', [Validators.required, Validators.email]],
    password: ['test123', Validators.required]
  });
  submitting = false;

  constructor(
    private builder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  login() {
    if (this.form.valid) {
      const { email, password } = this.form.value;
      this.authService.login(email, password)
        .subscribe(
          (result) => this.router.navigate(['/']),
          (error) => {
            console.log('error', error);
          }
        );
    }
  }
}
