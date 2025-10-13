import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthService } from '@modules/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly helper: JwtHelperService,
  ) { }

  canActivate(): boolean | UrlTree {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken || this.helper.isTokenExpired(refreshToken)) {
      return this.checkAccessToken();
    }

    try {
      const refreshDecoded = this.helper.decodeToken(refreshToken);
      if (!refreshDecoded) {
        return this.checkAccessToken();
      }
    }
    catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return this.checkAccessToken();
    }

    return true;
  }

  private checkAccessToken(): boolean | UrlTree {
    const token = sessionStorage.getItem('accessToken');
    if (!token || this.helper.isTokenExpired(token)) {
      return this.router.createUrlTree(['auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
    }

    try {
      const decodedToken = this.helper.decodeToken(token);
      if (!decodedToken) {
        return this.router.createUrlTree(['auth/login'], {
          queryParams: { returnUrl: this.router.url },
        });
      }
    }
    catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return this.router.createUrlTree(['auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
    }

    return true;
  }
}
