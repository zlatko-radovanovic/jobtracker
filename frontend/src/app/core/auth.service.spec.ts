import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('nije ulogovan na početku', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.token).toBeNull();
  });

  it('login čuva token i korisnika', () => {
    service.login({ username: 'marko', password: 'tajna123' }).subscribe();

    const req = http.expectOne('/api/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'abc', username: 'marko', role: 'USER' });

    expect(service.isLoggedIn()).toBeTrue();
    expect(service.token).toBe('abc');
    expect(localStorage.getItem('jobtracker_auth')).toContain('abc');
  });

  it('logout briše korisnika i token', () => {
    service.login({ username: 'marko', password: 'tajna123' }).subscribe();
    http.expectOne('/api/auth/login').flush({ token: 'abc', username: 'marko', role: 'USER' });

    service.logout();

    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('jobtracker_auth')).toBeNull();
  });
});
