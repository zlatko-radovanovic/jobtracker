import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/http-error';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="auth-card">
      <h1>Napravi nalog</h1>
      <p class="muted">Besplatno je i traje manje od minuta.</p>

      <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <div class="field">
          <label for="username">Korisničko ime</label>
          <input id="username" formControlName="username" autocomplete="username" />
          @if (invalid('username')) {
            <p class="field-error">Korisničko ime mora imati 3 do 50 karaktera.</p>
          }
        </div>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" type="email" formControlName="email" autocomplete="email" />
          @if (invalid('email')) {
            <p class="field-error">Unesi ispravnu email adresu.</p>
          }
        </div>

        <div class="field">
          <label for="password">Lozinka</label>
          <input id="password" type="password" formControlName="password" autocomplete="new-password" />
          @if (invalid('password')) {
            <p class="field-error">Lozinka mora imati najmanje 6 karaktera.</p>
          }
        </div>

        @if (error) {
          <p class="alert" role="alert">{{ error }}</p>
        }

        <button class="btn primary block" type="submit" [disabled]="loading">
          {{ loading ? 'Pravim nalog...' : 'Napravi nalog' }}
        </button>
      </form>

      <p class="muted center">Već imaš nalog? <a routerLink="/login">Prijavi se</a></p>
    </section>
  `,
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  loading = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  invalid(name: 'username' | 'email' | 'password'): boolean {
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
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (err) => {
        this.error = errorMessage(err);
        this.loading = false;
      },
    });
  }
}
