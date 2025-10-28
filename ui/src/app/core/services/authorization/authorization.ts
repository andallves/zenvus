import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {IUserToken} from '@shared/interfaces/auth.interface';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private readonly usuarioTokenSubject = new BehaviorSubject<IUserToken | null>(null);
  public readonly usuarioToken$ = this.usuarioTokenSubject.asObservable();

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    this.carregarDadosDoToken();
  }

  /**
   * Carrega os dados do usuário do token JWT
   */
  private carregarDadosDoToken(): void {
    try {
      // Verificar primeiro no sessionStorage (accessToken) e depois no localStorage (access_token)
      let token = sessionStorage.getItem('accessToken') || localStorage.getItem('access_token');

      console.log('🔍 Procurando token...');
      console.log('  sessionStorage.accessToken:', sessionStorage.getItem('accessToken') ? 'PRESENTE' : 'AUSENTE');
      console.log('  localStorage.access_token:', localStorage.getItem('access_token') ? 'PRESENTE' : 'AUSENTE');
      console.log('  Token encontrado:', token ? 'SIM' : 'NÃO');

      if (token) {
        const decodedToken = this.decodeJWT(token);
        console.log('🎫 Token decodificado com sucesso:', decodedToken);
        this.usuarioTokenSubject.next(decodedToken);
      } else {
        console.log('❌ Nenhum token encontrado');
        this.usuarioTokenSubject.next(null);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar dados do token:', error);
      this.usuarioTokenSubject.next(null);
    }
  }

  /**
   * Decodifica o token JWT
   */
  private decodeJWT(token: string)  {
    const payload = token.split('.')[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  }

  /**
   * Atualiza os dados do usuário quando o token é renovado
   */
  public atualizarToken(): void {
    this.carregarDadosDoToken();
  }

  /**
   * Limpa os dados de autorização (logout)
   */
  public limparAutorizacao(): void {
    this.usuarioTokenSubject.next(null);
  }

  /**
   * Obtém o usuário atual
   */
  public obterUsuario()  {
    return this.usuarioTokenSubject.value;
  }

  /**
   * Verifica se o token está válido (não expirado)
   */
  public tokenValido(): boolean {
    const usuario = this.usuarioTokenSubject.value;
    if (!usuario) {
      return false;
    }

    const agora = Date.now() / 1000;
    return usuario.exp > agora;
  }
}
