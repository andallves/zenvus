import { inject } from '@angular/core';
import { CanActivateFn, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthTokenService, REFRESH_TOKEN } from '@core/services/auth-token/auth-token.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree | Promise<boolean | UrlTree> => {
  const helper = inject(JwtHelperService);
  const authTokenService = inject(AuthTokenService);

  const refreshToken = authTokenService.getAuthToken(REFRESH_TOKEN);

  if (!refreshToken || authTokenService.hasAuthTokenValid(refreshToken)) {
    return authTokenService.checkAccessToken();
  }
  try {
    const refreshDecoded = helper.decodeToken(refreshToken);
    if (!refreshDecoded) {
      return authTokenService.checkAccessToken();
    }
  } catch {
    return authTokenService.checkAccessToken();
  }
  return true;
};
