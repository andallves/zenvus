import { Router, UrlTree } from '@angular/router';
import { AuthGuard } from './auth.guard';

// Para espionar métodos privados, usamos cast seguro para Record<string, unknown>.
function spyOnPrivate(obj: object, method: string): jasmine.Spy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return spyOn(obj as unknown as Record<string, any>, method);
}

describe(AuthGuard.name, () => {
  let guard: AuthGuard;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['createUrlTree']);
    Object.defineProperty(routerSpy, 'url', { get: () => '/protected' });
    (routerSpy.createUrlTree as jasmine.Spy).and.callFake(
      (commands: string[], opts?: object | undefined) => {
        return { commands, opts } as unknown as UrlTree;
      }
    );

    guard = new AuthGuard();
  });

  it('should allow activation when refresh token exists, is not expired and decodes', () => {
    spyOn(localStorage, 'getItem').and.returnValue('refresh-token');
    spyOnPrivate(guard, 'isTokenExpired').and.returnValue(false);
    spyOnPrivate(guard, 'decodeToken').and.returnValue({ sub: '123' });

    const result = guard.canActivate();

    expect(result).toBeTrue();
    expect(spyOnPrivate(guard, 'isTokenExpired')).toHaveBeenCalledWith('refresh-token');
    expect(spyOnPrivate(guard, 'decodeToken')).toHaveBeenCalledWith('refresh-token');
  });

  it('should fall back to checkAccessToken when refresh token missing', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOnPrivate(guard, 'checkAccessToken').and.returnValue(
      routerSpy.createUrlTree(['auth/login'], { queryParams: { returnUrl: routerSpy.url } })
    );

    const result = guard.canActivate();

    expect(spyOnPrivate(guard, 'checkAccessToken')).toHaveBeenCalled();
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should fall back to checkAccessToken when refresh token decode returns falsy', () => {
    spyOn(localStorage, 'getItem').and.returnValue('refresh-token');
    spyOnPrivate(guard, 'isTokenExpired').and.returnValue(false);
    spyOnPrivate(guard, 'decodeToken').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOnPrivate(guard, 'checkAccessToken').and.returnValue(
      routerSpy.createUrlTree(['auth/login'], { queryParams: { returnUrl: routerSpy.url } })
    );

    const result = guard.canActivate();

    expect(spyOnPrivate(guard, 'checkAccessToken')).toHaveBeenCalled();
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should redirect to login when refresh token present but decode throws', () => {
    spyOn(localStorage, 'getItem').and.returnValue('refresh-token');
    spyOnPrivate(guard, 'isTokenExpired').and.returnValue(false);
    spyOnPrivate(guard, 'decodeToken').and.throwError('decode error');
    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    const result = guard.canActivate();

    expect(result).toEqual(jasmine.any(Object));
    expect(routerSpy.createUrlTree).toHaveBeenCalledWith(['auth/login'], {
      queryParams: { returnUrl: routerSpy.url },
    });
  });

  it('should redirect when access token missing', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue(null);
    spyOnPrivate(guard, 'checkAccessToken').and.returnValue(
      routerSpy.createUrlTree(['auth/login'], { queryParams: { returnUrl: routerSpy.url } })
    );

    const result = guard.canActivate();

    expect(spyOnPrivate(guard, 'checkAccessToken')).toHaveBeenCalled();
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should redirect when access token expired', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue('access-token');
    spyOnPrivate(guard, 'isTokenExpired').and.callFake((t: string) => t === 'access-token');
    spyOnPrivate(guard, 'checkAccessToken').and.returnValue(
      routerSpy.createUrlTree(['auth/login'], { queryParams: { returnUrl: routerSpy.url } })
    );

    const result = guard.canActivate();

    expect(spyOnPrivate(guard, 'isTokenExpired')).toHaveBeenCalledWith('access-token');
    expect(spyOnPrivate(guard, 'checkAccessToken')).toHaveBeenCalled();
    expect(result).toEqual(jasmine.any(Object));
  });

  it('should redirect when access token decode returns falsy', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    spyOn(sessionStorage, 'getItem').and.returnValue('access-token');
    spyOnPrivate(guard, 'isTokenExpired').and.returnValue(false);
    spyOnPrivate(guard, 'decodeToken').and.returnValue(null);
    spyOnPrivate(guard, 'checkAccessToken').and.returnValue(
      routerSpy.createUrlTree(['auth/login'], { queryParams: { returnUrl: routerSpy.url } })
    );

    const result = guard.canActivate();

    expect(spyOnPrivate(guard, 'decodeToken')).toHaveBeenCalledWith('access-token');
    expect(spyOnPrivate(guard, 'checkAccessToken')).toHaveBeenCalled();
    expect(result).toEqual(jasmine.any(Object));
  });
});
