import {
  HttpErrorResponse,
  HttpEvent,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';
import { Observable, of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';

type NextFn = (req: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>;

describe(authInterceptor.name, () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let authTokenServiceSpy: jasmine.SpyObj<AuthTokenService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/current' });
    (routerSpy.navigate as jasmine.Spy).and.returnValue(Promise.resolve(true));

    authTokenServiceSpy = jasmine.createSpyObj('AuthTokenService', ['clearTokenFromStorage']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthTokenService, useValue: authTokenServiceSpy },
      ],
    });
  });

  afterEach(() => {
    // restore potential spy on sessionStorage.getItem
    (sessionStorage.getItem as unknown as jasmine.Spy)?.and?.callThrough?.();
  });

  it('forwards the request when skip header is present', done => {
    const req = new HttpRequest<unknown>('GET', '/test', undefined, {
      headers: new HttpHeaders({ skip: 'true' }),
    });

    const next: NextFn = (request: HttpRequest<unknown>) => {
      expect(request).toBe(req);
      return of(new HttpResponse<unknown>({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);
      out$.subscribe({
        next: () => done(),
        error: e => fail(e),
      });
    });
  });

  it('clears storage and redirects when access token is missing (returns EMPTY)', done => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    const req = new HttpRequest<unknown>('GET', '/test');
    const next: jasmine.Spy<(r: HttpRequest<unknown>) => Observable<HttpEvent<unknown>>> =
      jasmine.createSpy('next');

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next as unknown as NextFn);

      let emitted = false;
      out$.subscribe({
        next: () => (emitted = true),
        complete: () => {
          expect(emitted).toBeFalse();
          expect(authTokenServiceSpy.clearTokenFromStorage).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login'], {
            queryParams: { returnUrl: routerSpy.url },
          });
          expect(next).not.toHaveBeenCalled();
          done();
        },
        error: e => fail(e),
      });
    });
  });

  it('adds Authorization header when token exists and forwards response', done => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest<unknown>('GET', '/resource');

    const next: NextFn = (request: HttpRequest<unknown>) => {
      expect(request.headers.get('Authorization')).toBe('Bearer my-token');
      return of(new HttpResponse<{ ok: boolean }>({ status: 200, body: { ok: true } }));
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);
      out$.subscribe({
        next: res => {
          expect((res as HttpResponse<{ ok: boolean }>).body).toEqual({ ok: true });
          done();
        },
        error: e => fail(e),
      });
    });
  });

  it('on HttpErrorResponse 401 clears storage and redirects', done => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest<unknown>('GET', '/resource');
    const err = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

    const next: NextFn = (_req: HttpRequest<unknown>) => {
      void _req;
      return throwError(() => err);
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);

      out$.subscribe({
        next: () => fail('should not emit next'),
        error: () => {
          expect(authTokenServiceSpy.clearTokenFromStorage).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login'], {
            queryParams: { returnUrl: routerSpy.url },
          });
          done();
        },
      });
    });
  });

  it('on HttpErrorResponse non-401 does not clear storage or navigate', done => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest<unknown>('GET', '/resource');
    const err = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });

    const next: NextFn = (_req: HttpRequest<unknown>) => {
      void _req;
      return throwError(() => err);
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);

      out$.subscribe({
        next: () => fail('should not emit next'),
        error: () => {
          expect(authTokenServiceSpy.clearTokenFromStorage).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });

  it('on non-HttpErrorResponse error (generic Error) does not clear storage or navigate', done => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest<unknown>('GET', '/resource');
    const err = new Error('network');

    const next: NextFn = (_req: HttpRequest<unknown>) => {
      void _req;
      return throwError(() => err);
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);

      out$.subscribe({
        next: () => fail('should not emit next'),
        error: () => {
          expect(authTokenServiceSpy.clearTokenFromStorage).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        },
      });
    });
  });
});
