import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="topbar">
      <a class="brand" routerLink="/">JobTracker</a>
      @if (auth.user(); as user) {
        <nav aria-label="Glavna navigacija">
          <a routerLink="/dashboard" routerLinkActive="active">Pregled</a>
          <a routerLink="/applications" routerLinkActive="active">Prijave</a>
          <a routerLink="/companies" routerLinkActive="active">Firme</a>
        </nav>
        <div class="user">
          <span>{{ user.username }}</span>
          <button type="button" class="btn ghost" (click)="logout()">Odjavi se</button>
        </div>
      }
    </header>
    <main class="container">
      <router-outlet />
    </main>
  `,
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
