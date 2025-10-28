import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {environment} from '@env/environment.development';
import Token from '@modules/auth/models/token.model';
import {Observable, take} from 'rxjs';

export const ACCESS_TOKEN = 'accessToken';
export const EXPIRATION = 'expiration';
export const REFRESH_TOKEN = 'refreshToken';
export const EXPIRATION_REFRESH_TOKEN = 'expirationRefreshToken';

@Injectable({
  providedIn: 'root'
})
export class AuthTokenService {
  private readonly httpClient = inject(HttpClient);

  refreshToken(refreshToken: string): Observable<Token> {
    return this.httpClient.post<Token>(
      `${environment.apiUrl}/v1/auth/refresh-token`,
      { refreshToken },
      { headers: { skip: 'true' }}
    );
  }

  setTokenInStorage(token: Token, connected: boolean = true): void {
    sessionStorage.setItem(ACCESS_TOKEN, token.token ?? '');
    sessionStorage.setItem(EXPIRATION, token.expiration?.toString() ?? '');
    if (connected) {
      localStorage.setItem(REFRESH_TOKEN, token.refreshToken ?? '');
      localStorage.setItem(EXPIRATION_REFRESH_TOKEN, token.expirationRefreshToken?.toString() ?? '');
    }

  }

  clearTokenFromStorage(): void {
    sessionStorage.removeItem('ACCESS_TOKEN');
    sessionStorage.removeItem('EXPIRATION');
    localStorage.removeItem('REFRESH_TOKEN');
    localStorage.removeItem('EXPIRATION_REFRESH_TOKEN');
  }
}
