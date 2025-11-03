import { inject, Injectable } from '@angular/core';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';
import Token from '@modules/auth/models/token.model';
import { IUserToken } from '@shared/interfaces/auth.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private readonly userTokenSubject = new BehaviorSubject<IUserToken | null>(null);
  public readonly userToken$ = this.userTokenSubject.asObservable();

  private readonly authTokenService = inject(AuthTokenService);

  constructor() {
    this.loadTokenData();
  }

  /**
   * Carrega os dados do usuário do token JWT
   */
  private loadTokenData(): void {
    try {
      // Verificar primeiro no sessionStorage (accessToken) e depois no localStorage (access_token)
      const token = sessionStorage.getItem('accessToken') || localStorage.getItem('access_token');

      console.log('🔍 Procurando token...');
      console.log(
        '  sessionStorage.accessToken:',
        sessionStorage.getItem('accessToken') ? 'PRESENTE' : 'AUSENTE'
      );
      console.log(
        '  localStorage.access_token:',
        localStorage.getItem('access_token') ? 'PRESENTE' : 'AUSENTE'
      );
      console.log('  Token encontrado:', token ? 'SIM' : 'NÃO');

      if (token) {
        const decodedToken = this.decodeJWT(token);
        console.log('🎫 Token decodificado com sucesso:', decodedToken);
        this.userTokenSubject.next(decodedToken);
      } else {
        console.log('❌ Nenhum token encontrado');
        this.userTokenSubject.next(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do token:', error);
      this.userTokenSubject.next(null);
    }
  }

  /**
   * Decodifica o token JWT
   */
  private decodeJWT(token: string): IUserToken {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload) as IUserToken;
  }

  /**
   * Atualiza os dados do usuário quando o token é renovado
   */
  public updateToken(): void {
    this.loadTokenData();
  }

  /**
   * Limpa os dados de autorização (logout)
   */
  private cleanAuthorization(): void {
    this.userTokenSubject.next(null);
  }

  /**
   * Obtém o usuário atual
   */
  public getUser() {
    return this.userTokenSubject.value;
  }

  /**
   * Verifica se o token está válido (não expirado)
   */
  public isValidToken(): boolean {
    const user = this.userTokenSubject.value;
    if (!user) {
      return false;
    }

    const now = Date.now() / 1000;
    return user.exp > now;
  }

  public saveToken(token: Token, keepConnected: boolean): void {
    this.authTokenService.setTokenInStorage(token, keepConnected);
  }

  public logout(): void {
    this.authTokenService.clearTokenFromStorage();
    this.cleanAuthorization();
  }

  public isLoggedIn(): boolean {
    return this.authTokenService.hasAuthToken();
  }
}
