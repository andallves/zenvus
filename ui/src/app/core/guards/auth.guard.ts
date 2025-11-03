import { inject, Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '@core/services/auth-token/auth-token.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  private readonly router = inject(Router);
  private readonly helper = inject(JwtHelperService);

  canActivate(): boolean | UrlTree {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN);
    if (!refreshToken || this.helper.isTokenExpired(refreshToken)) {
      return this.checkAccessToken();
    }

    try {
      const refreshDecoded = this.helper.decodeToken(refreshToken);
      if (!refreshDecoded) {
        return this.checkAccessToken();
      }
    } catch {
      return this.checkAccessToken();
    }

    return true;
  }

  private checkAccessToken(): boolean | UrlTree {
    const token = sessionStorage.getItem(ACCESS_TOKEN);
    if (!token || this.helper.isTokenExpired(token)) {
      return this.router.createUrlTree(['auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
    }
    if (!token) return false;

    try {
      const decodedToken = this.helper.decodeToken(token);
      if (!decodedToken) {
        return this.router.createUrlTree(['auth/login'], {
          queryParams: { returnUrl: this.router.url },
        });
      }
    } catch {
      return this.router.createUrlTree(['auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
    }

    return true;
  }
}
