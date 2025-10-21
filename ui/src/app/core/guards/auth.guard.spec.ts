import { UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';

describe(AuthGuard.name, () => {
  let guard: AuthGuard;
  let routerSpy: any;
  let helperSpy: any;

  beforeEach(() => {
    routerSpy = {
      url: '/protected',
      createUrlTree: jasmine.createSpy('createUrlTree').and.callFake((commands: any[], opts: any) => {
        return ({ commands, opts } as unknown) as UrlTree;
      }),
    };

    helperSpy = {
      isTokenExpired: jasmine.createSpy('isTokenExpired'),
      decodeToken: jasmine.createSpy('decodeToken'),
    };

    guard = new AuthGuard(routerSpy, helperSpy as any);
  });

  afterEach(() => {
    // restore spies on storage if set
    (localStorage.getItem as any)?.and?.callThrough?.();
    (sessionStorage.getItem as any)?.and?.callThrough?.();
  });

  it('should allow activation when refresh token exists, is not expired and decodes', () => {
    spyOn(localStorage, 'getItem').and.returnValue('refresh-token');
    (helperSpy.isTokenExpired as jasmine.Spy).and.returnValue(false);
    (helperSpy.decodeToken as jasmine.Spy).and.returnValue({ sub: '123' });

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(helperSpy.isTokenExpired).toHaveBeenCalledWith('refresh-token');
    expect(helperSpy.decodeToken).toHaveBeenCalledWith('refresh-token');
  });

  it('should fall back to checkAccessToken when refresh token missing', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    const result = guard.canActivate();

    expect(result).toEqual(jasmine.any(Object));
    // since access token missing it should return a UrlTree-like object created by router
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: routerSpy.url } });
  });

  it('should fall back to checkAccessToken when refresh token decode returns falsy', () => {
    spyOn(localStorage, 'getItem').and.returnValue('refresh-token');
    (helperSpy.isTokenExpired as jasmine.Spy).and.returnValue(false);
    (helperSpy.decodeToken as jasmine.Spy).and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    const expected = routerSpy.createUrlTree(['auth/login'], { queryParams: { returnUrl: routerSpy.url } });
    spyOn(guard as any, 'checkAccessToken').and.returnValue(expected);

    const result = guard.canActivate();

    expect((guard as any).checkAccessToken).toHaveBeenCalled();
    expect(result).toBe(expected);
  });

  it('should redirect to login when refresh token present but decode throws', () => {
    spyOn(localStorage, 'getItem').and.returnValue('refresh-token');
    (helperSpy.isTokenExpired as jasmine.Spy).and.returnValue(false);
    (helperSpy.decodeToken as jasmine.Spy).and.throwError('decode error');
    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    const result = guard.canActivate();

    expect(result).toEqual(jasmine.any(Object));
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: routerSpy.url } });
  });

  it('should redirect when access token missing', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    const result = guard.canActivate();

    expect(result).toEqual(jasmine.any(Object));
    expect(routerSpy.createUrlTree).toHaveBeenCalled();
  });

  it('should redirect when access token expired', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue('access-token');
    (helperSpy.isTokenExpired as jasmine.Spy).and.callFake((t: string) => t === 'access-token');

    const result = guard.canActivate();

    expect(helperSpy.isTokenExpired).toHaveBeenCalledWith('access-token');
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: routerSpy.url } });
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should redirect when access token decode returns falsy', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue('access-token');
    (helperSpy.isTokenExpired as jasmine.Spy).and.returnValue(false);
    (helperSpy.decodeToken as jasmine.Spy).and.returnValue(null);

    const result = guard.canActivate();

    expect(helperSpy.decodeToken).toHaveBeenCalledWith('access-token');
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: routerSpy.url } });
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should redirect when access token decode throws', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue('access-token');
    (helperSpy.isTokenExpired as jasmine.Spy).and.returnValue(false);
    (helperSpy.decodeToken as jasmine.Spy).and.throwError('boom');

    const result = guard.canActivate();

    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['auth/login'], { queryParams: { returnUrl: routerSpy.url } });
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should allow activation when access token valid and decodes', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue('access-token');
    (helperSpy.isTokenExpired as jasmine.Spy).and.returnValue(false);
    (helperSpy.decodeToken as jasmine.Spy).and.returnValue({ sub: 'user' });

    const result = guard.canActivate();

    expect(result).toBeTrue();
  });
});
