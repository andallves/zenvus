import { inject } from '@angular/core';
import { CanActivateFn, UrlTree } from '@angular/router';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';

export const authGuard: CanActivateFn = (): boolean | UrlTree | Promise<boolean | UrlTree> => {
  const authTokenService = inject(AuthTokenService);

  if (authTokenService.isAccessTokenValid() || authTokenService.isRefreshTokenValid()) {
    return true;
  }

  return authTokenService.redirectToLogin();
};
