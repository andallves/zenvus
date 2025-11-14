import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SKIP_AUTH } from '@core/guards/http-context-tokens';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';
import { environment } from '@env/environment.development';
import { Authenticate } from '@modules/auth/interfaces/authenticate.interface';
import Token from '@modules/auth/models/token.model';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authTokenService = inject(AuthTokenService);

  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

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
