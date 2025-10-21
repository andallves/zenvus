import { TestBed } from '@angular/core/testing';
import {HttpRequest, HttpHandler, HttpErrorResponse, HttpEvent, HttpResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '@modules/auth/services/auth.service';
import { authInterceptor } from './auth.interceptor';
import {Observable, of, throwError} from 'rxjs';

describe('authInterceptor', () => {
  let routerSpy: jasmine.SpyObj<Router>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let next: jasmine.SpyObj<HttpHandler>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: '/home' });
    authServiceSpy = jasmine.createSpyObj('AuthService', ['clearTokenFromStorage']);
    next = jasmine.createSpyObj('HttpHandler', ['handle']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    });
    sessionStorage.clear();
  });

  // it('deve adicionar o token ao header se existir', (done) => {
  //   sessionStorage.setItem('accessToken', 'fake-token');
  //   const req = new HttpRequest('GET', '/test');
  //
  //   let next: jasmine.SpyObj<HttpHandler>;
  //   next = jasmine.createSpyObj('HttpHandler', ['handle']);
  //   next.handle.and.returnValue(of(new HttpResponse({ status: 200 })));
  //
  //   authInterceptor(req, next).subscribe(() => {
  //     expect(next.handle).toHaveBeenCalled();
  //     const calledReq = next.handle.calls.mostRecent().args[0];
  //     expect(calledReq.headers.get('Authorization')).toBe('Bearer fake-token');
  //     done();
  //   });
  // });

  it('deve redirecionar para login se não houver token', (done) => {
    const req = new HttpRequest('GET', '/test');
    let next: (req: HttpRequest<any>) => Observable<HttpEvent<any>>;
    next = jasmine.createSpy().and.returnValue(of(new HttpResponse({ status: 200 })));

    authInterceptor(req, next).subscribe({
      complete: () => {
        expect(authServiceSpy.clearTokenFromStorage).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: '/home' } });
        done();
      }
    });
  });

  it('deve limpar token e redirecionar ao receber erro 401', (done) => {
    sessionStorage.setItem('accessToken', 'fake-token');
    const req = new HttpRequest('GET', '/test');
    const error = new HttpErrorResponse({ status: 401 });
    let next: (req: HttpRequest<any>) => Observable<HttpEvent<any>>;
    next = jasmine.createSpy().and.returnValue(throwError(() => error));

    authInterceptor(req, next).subscribe({
      error: () => {
        expect(authServiceSpy.clearTokenFromStorage).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: '/home' } });
        done();
      }
    });
  });
});
