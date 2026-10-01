import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;

  function setup(): void {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => controller.verify());

  it('dodaje Authorization header kada postoji token', () => {
    localStorage.setItem('jobtracker_auth', JSON.stringify({ token: 'abc', username: 'marko', role: 'USER' }));
    setup();

    http.get('/api/companies').subscribe();

    const req = controller.expectOne('/api/companies');
    expect(req.request.headers.get('Authorization')).toBe('Bearer abc');
    req.flush([]);
  });

  it('ne dodaje header kada nema tokena', () => {
    setup();

    http.get('/api/companies').subscribe();

    const req = controller.expectOne('/api/companies');
    expect(req.request.headers.has('Authorization')).toBeFalse();
    req.flush([]);
  });
});
