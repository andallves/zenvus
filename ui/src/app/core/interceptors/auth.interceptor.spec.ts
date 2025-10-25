import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HttpRequest, HttpHeaders, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from '@modules/auth/services/auth.service';

describe(authInterceptor.name, () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    // provide a url property similar to Router
    (routerSpy as any).url = '/current';
    (routerSpy.navigate as jasmine.Spy).and.returnValue(Promise.resolve(true));

    authServiceSpy = jasmine.createSpyObj('AuthService', ['clearTokenFromStorage']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
      ],
    });
  });

  afterEach(() => {
    // restore sessionStorage spy if set
    (sessionStorage.getItem as any)?.and?.callThrough?.();
  });

  it('forwards the request when skip header is present', (done) => {
    const req = new HttpRequest('GET', '/test', { headers: new HttpHeaders({ skip: 'true' }) });

    const next = (_req: HttpRequest<any>) => {
      // should receive the original request (no cloning for skip)
      expect(_req).toBe(req);
      return of(new HttpResponse({ status: 200 }));
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);
      out$.subscribe({
        next: () => done(),
        error: (e) => fail(e),
      });
    });
  });

  it('clears storage and redirects when access token is missing (returns EMPTY)', (done) => {
    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    const req = new HttpRequest('GET', '/test');
    const next = jasmine.createSpy('next');

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next as any);

      let emitted = false;
      out$.subscribe({
        next: () => emitted = true,
        complete: () => {
          expect(emitted).toBeFalse();
          expect(authServiceSpy.clearTokenFromStorage).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: (routerSpy as any).url } });
          expect(next).not.toHaveBeenCalled();
          done();
        },
        error: (e) => fail(e),
      });
    });
  });

  it('adds Authorization header when token exists and forwards response', (done) => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest('GET', '/resource');

    const next = (r: HttpRequest<any>) => {
      expect(r.headers.get('Authorization')).toBe('Bearer my-token');
      return of(new HttpResponse({ status: 200, body: { ok: true } }));
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);
      out$.subscribe({
        next: (res) => {
          expect((res as HttpResponse<any>).body).toEqual({ ok: true });
          done();
        },
        error: (e) => fail(e),
      });
    });
  });

  it('on HttpErrorResponse 401 clears storage and redirects', (done) => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest('GET', '/resource');
    const err = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });

    const next = (_req: HttpRequest<any>) => {
      return throwError(() => err);
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);

      out$.subscribe({
        next: () => fail('should not emit next'),
        error: () => {
          // error path should still trigger tap error handler
          expect(authServiceSpy.clearTokenFromStorage).toHaveBeenCalled();
          expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: (routerSpy as any).url } });
          done();
        }
      });
    });
  });

  it('on HttpErrorResponse non-401 does not clear storage or navigate', (done) => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest('GET', '/resource');
    const err = new HttpErrorResponse({ status: 500, statusText: 'Server Error' });

    const next = (_req: HttpRequest<any>) => {
      return throwError(() => err);
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);

      out$.subscribe({
        next: () => fail('should not emit next'),
        error: () => {
          expect(authServiceSpy.clearTokenFromStorage).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });

  it('on non-HttpErrorResponse error (generic Error) does not clear storage or navigate', (done) => {
    spyOn(sessionStorage, 'getItem').and.returnValue('my-token');

    const req = new HttpRequest('GET', '/resource');
    const err = new Error('network');

    const next = (_req: HttpRequest<any>) => {
      return throwError(() => err);
    };

    TestBed.runInInjectionContext(() => {
      const out$ = authInterceptor(req, next);

      out$.subscribe({
        next: () => fail('should not emit next'),
        error: () => {
          expect(authServiceSpy.clearTokenFromStorage).not.toHaveBeenCalled();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
          done();
        }
      });
    });
  });
});
