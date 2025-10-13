import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthGuard } from './auth.guard';
import { AuthService } from '@modules/auth/services/auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let routerSpy = { navigate: jasmine.createSpy('navigate') };
  let authServiceSpy = { clearTokenFromStorage: jasmine.createSpy('clearTokenFromStorage') };
  let jwtHelperSpy: jasmine.SpyObj<JwtHelperService>;

  beforeEach(() => {
    jwtHelperSpy = jasmine.createSpyObj('JwtHelperService', ['isTokenExpired', 'decodeToken']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: JwtHelperService, useValue: jwtHelperSpy }
      ],
    });

    guard = TestBed.inject(AuthGuard);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  it('should allow activation when refreshToken is valid', async () => {
    const validRefreshToken = 'validRefreshToken';
    localStorage.setItem('refreshToken', validRefreshToken);
    jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(false));
    jwtHelperSpy.decodeToken.and.returnValue({ exp: Date.now() + 1000 });
    const result = guard.canActivate();
    expect(result).toBe(true);
  });

  it('should redirect to login when refreshToken is expired', async () => {
    const expiredRefreshToken = 'expiredRefreshToken';
    localStorage.setItem('refreshToken', expiredRefreshToken);
    jwtHelperSpy.isTokenExpired.and.returnValue(Promise.resolve(true));
    guard.canActivate();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['auth/login'], jasmine.any(Object));
  });
});

