import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

// loadComponent = lazy loading: kod stranice se učitava tek kad korisnik dođe na nju
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'applications',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/application-list.component').then((m) => m.ApplicationListComponent),
  },
  {
    path: 'applications/new',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/application-form.component').then((m) => m.ApplicationFormComponent),
  },
  {
    path: 'applications/:id/edit',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/applications/application-form.component').then((m) => m.ApplicationFormComponent),
  },
  {
    path: 'companies',
    canActivate: [authGuard],
    loadComponent: () => import('./features/companies/company-list.component').then((m) => m.CompanyListComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
