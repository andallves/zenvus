import {HttpClient, HttpHeaders} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {Authenticate} from '@modules/auth/interfaces/authenticate.interface';
import {RegisterUser} from '@modules/auth/interfaces/register-user.interface';
import {environment} from '@env/environment.development';
import Token from '@modules/auth/models/token.model';
import {Observable, take} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  register(userData: FormData): Observable<RegisterUser> {
    console.log('Esta chegando no service de autenticação')
    return this.httpClient.post<RegisterUser>(
      `${this.apiUrl}/v1/user`,
      userData,
      {
        headers: new HttpHeaders().set('skip', 'true')
      }
    ).pipe(take(1));
  }

  login(credentials: Authenticate): Observable<Token> {
    return this.httpClient.post<Token>(
      `${environment.apiUrl}/v1/auth/login`,
      credentials,
      { headers: { skip: 'true' }}
    );
  }

  refreshToken(refreshToken: string): Observable<Token> {
    return this.httpClient.post<Token>(
        `${environment.apiUrl}/v1/auth/refresh-token`,
      { refreshToken },
      { headers: { skip: 'true' }}
    );
  }

  recuperarSenha(identificacao: string): Observable<void> {
    return this.httpClient.post<void>(
      `${environment.apiUrl}/v1/auth/recuperar-senha`,
      { identificacao },
      { headers: { skip: 'true' }}
    );
  }

  verificarCodigoRecuperacaoSenha(dados: { codigo: string, email: string}): Observable<boolean> {
    return this.httpClient.post<boolean>(
      `${environment.apiUrl}/v1/auth/verificar-codigo`,
      dados,
      { headers: { skip: 'true' }});
  }

  alterarSenha(dados: { senha: string, confirmarSenha: string}): Observable<boolean> {
    return this.httpClient.post<boolean>(
      `${environment.apiUrl}/v1/auth/alterar-senha`,
      dados,
      { headers: { skip: 'true' }});
  }

  setTokenInStorage(token: Token): void {
    sessionStorage.setItem('accessToken', token.token ?? '');
    sessionStorage.setItem('expiration', token.expiration?.toString() ?? '');
    localStorage.setItem('refreshToken', token.refreshToken ?? '');
    localStorage.setItem('expirationRefreshToken', token.expirationRefreshToken?.toString() ?? '');
  }

  clearTokenFromStorage(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('expiration');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expirationRefreshToken');
  }

}
