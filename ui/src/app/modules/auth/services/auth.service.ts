import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {AuthTokenService} from '@core/services/auth-token/auth-token.service';
import {Authenticate} from '@modules/auth/interfaces/authenticate.interface';
import {environment} from '@env/environment.development';
import Token from '@modules/auth/models/token.model';
import {Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  constructor(private readonly authTokenService: AuthTokenService) {}

  authenticate(credentials: Authenticate, keepConnected: boolean = false): Observable<Token> {
    return this.httpClient
      .post<Token>(
        `${this.apiUrl}/v1/auth/login`,
        credentials,
        { headers: { skip: 'true' }}
      )
      .pipe(
        tap(
          (response) => {
            this.authTokenService.setTokenInStorage(response, keepConnected);
          }
        )
      );
  }
}
