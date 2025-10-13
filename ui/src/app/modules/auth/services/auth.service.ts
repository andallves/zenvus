import {HttpClient} from '@angular/common/http';
import {inject, Injectable} from '@angular/core';
import {SignUpUser} from '@core/interfaces/signup-user.interface';
import {environment} from '@env/environment.development';
import Token from '@modules/auth/models/token.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = environment.apiUrl;
  private readonly httpClient = inject(HttpClient);

  register(userData: FormData): Observable<SignUpUser> {
    return this.httpClient.post<SignUpUser>(
      `${this.apiUrl}/user`,
      userData
    );
  }

  login(credenciais: { identificacao: string, senha: string }): Observable<Token> {
    return this.httpClient.post<Token>(
      `${environment.apiUrl}/v1/auth/login`,
      credenciais,
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
    sessionStorage.setItem('expiracao', token.expiracao?.toString() ?? '');
    localStorage.setItem('refreshToken', token.refreshToken ?? '');
    localStorage.setItem('expiracaoRefreshToken', token.expiracaoRefreshToken?.toString() ?? '');
  }

  clearTokenFromStorage(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('expiracao');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('expiracaoRefreshToken');
  }

}
