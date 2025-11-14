import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { environment } from '@env/environment.development';
import Token from '@modules/auth/models/token.model';
import { Observable } from 'rxjs';

export const ACCESS_TOKEN = 'accessToken';
export const EXPIRATION = 'expiration';
export const REFRESH_TOKEN = 'refreshToken';
export const EXPIRATION_REFRESH_TOKEN = 'expirationRefreshToken';

@Injectable({
  providedIn: 'root',
})
export class AuthTokenService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);
  private readonly helper = inject(JwtHelperService);
  private readonly router = inject(Router);

  getAccessToken(): string | null {
    return sessionStorage.getItem(ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN);
  }

  refreshToken(refreshToken: string): Observable<Token> {
    return this.httpClient.post<Token>(
      `${this.apiUrl}/v1/auth/refresh-token`,
      { refreshToken },
      { headers: { skip: 'true' } }
    );
  }

  setTokenInStorage(token: Token, connected = true): void {
    sessionStorage.setItem(ACCESS_TOKEN, token.token ?? '');
    sessionStorage.setItem(EXPIRATION, token.expiration?.toString() ?? '');
    if (connected) {
      localStorage.setItem(REFRESH_TOKEN, token.refreshToken ?? '');
      localStorage.setItem(
        EXPIRATION_REFRESH_TOKEN,
        token.expirationRefreshToken?.toString() ?? ''
      );
    }
  }

  clearTokenFromStorage(): void {
    sessionStorage.removeItem(ACCESS_TOKEN);
    sessionStorage.removeItem(EXPIRATION);
    localStorage.removeItem(REFRESH_TOKEN);
    localStorage.removeItem(EXPIRATION_REFRESH_TOKEN);
  }

  hasAuthTokenValid(token: string): boolean {
    return !this.helper.isTokenExpired(token);
  }

  isAccessTokenValid(): boolean | UrlTree {
    const token = this.getAccessToken();
    return !!token && !this.helper.isTokenExpired(token);
  }

  isRefreshTokenValid(): boolean {
    const token = this.getRefreshToken();
    return !!token && !this.helper.isTokenExpired(token);
  }

  redirectToLogin(): UrlTree {
    return this.router.createUrlTree(['auth/login'], {
      queryParams: { returnUrl: this.router.url },
    });
  }

  handleUnauthorized(): void {
    this.clearTokenFromStorage();
    this.router
      .navigate(['auth/login'], {
        queryParams: { returnUrl: this.router.url },
      })
      .then();
  }
}
