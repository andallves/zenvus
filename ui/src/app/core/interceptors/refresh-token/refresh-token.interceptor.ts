import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { SKIP_AUTH } from '@core/guards/http-context-tokens';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  if (!shouldRefreshToken()) {
    return next(req);
  }

  const authTokenService = inject(AuthTokenService);
  const refreshToken = authTokenService.getRefreshToken();

  if (!refreshToken || !authTokenService.isRefreshTokenValid()) {
    authTokenService.handleUnauthorized();
    return EMPTY;
  }

  return authTokenService.refreshToken(refreshToken).pipe(
    catchError(() => {
      authTokenService.handleUnauthorized();
      return EMPTY;
    }),
    tap(token => authTokenService.setTokenInStorage(token)),
    switchMap(() => {
      return next(req);
    })
  );
};

const shouldRefreshToken = (): boolean => {
  const authTokenService = inject(AuthTokenService);
  const token = authTokenService.getAccessToken();
  if (!token) return true;

  const helper = new JwtHelperService();
  const expirationDate = helper.getTokenExpirationDate(token);
  if (!expirationDate) return true;

  const now = new Date();
  const diffInMinutes = (expirationDate.getTime() - now.getTime()) / 1000 / 60;
  return diffInMinutes <= 5;
};
