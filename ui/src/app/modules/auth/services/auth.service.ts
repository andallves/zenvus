import { HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SKIP_AUTH } from '@core/guards/http-context-tokens';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';
import { BaseService } from '@core/services/base.service';
import { Authenticate } from '@modules/auth/interfaces/authenticate.interface';
import Token from '@modules/auth/models/token.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  private readonly authTokenService = inject(AuthTokenService);

  authenticate(credentials: Authenticate, keepConnected = false): Observable<Token> {
    return this.httpClient
      .post<Token>(`${this.apiUrl}/v1/auth/login`, credentials, {
        context: new HttpContext().set(SKIP_AUTH, true),
      })
      .pipe(
        tap(response => {
          this.authTokenService.setTokenInStorage(response, keepConnected);
        })
      );
  }
}
