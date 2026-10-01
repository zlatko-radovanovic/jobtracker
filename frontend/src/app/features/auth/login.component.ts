import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/http-error';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Prijava</h1>
      <p class="muted">Prati svaku prijavu za posao na jednom mestu.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="username">Korisničko ime</label>
          <input id="username" formControlName="username" autocomplete="username" />
          @if (invalid('username')) {
            <p class="field-error">Unesi korisničko ime.</p>
          }
        </div>

        <div class="field">
          <label for="password">Lozinka</label>
          <input id="password" type="password" formControlName="password" autocomplete="current-password" />
          @if (invalid('password')) {
            <p class="field-error">Unesi lozinku.</p>
          }
        </div>

        @if (error) {
          <p class="alert" role="alert">{{ error }}</p>
        }

        <button class="btn primary block" type="submit" [disabled]="loading">
          {{ loading ? 'Prijavljujem...' : 'Prijavi se' }}
        </button>
      </form>

      <p class="muted center">Nemaš nalog? <a routerLink="/register">Registruj se</a></p>
    </section>
  `,
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  invalid(name: 'username' | 'password'): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = errorMessage(err);
        this.loading = false;
      },
    });
  }
}
