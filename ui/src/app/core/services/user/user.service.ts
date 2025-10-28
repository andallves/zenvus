// import {HttpClient, HttpHeaders} from '@angular/common/http';
// import {inject, Injectable} from '@angular/core';
// import {environment} from '@env/environment.development';
// import {Authenticate} from '@modules/auth/interfaces/authenticate.interface';
// import {RegisterUser} from '@modules/auth/interfaces/register-user.interface';
// import Token from '@modules/auth/models/token.model';
// import {BehaviorSubject, Observable, take} from 'rxjs';
//
// @Injectable({
//   providedIn: 'root'
// })
// export class UserService {
//   private readonly apiUrl = environment.apiUrl;
//   private readonly httpClient = inject(HttpClient);
//   private userSubject$ = new BehaviorSubject<User | null>(null);
//
//   constructor(private tokenService: AuthTokenService) {
//     if (tokenService.getAuthToken()) {
//       this.decodeJWT();
//     }
//   }
//
//   public decodeJWT() {
//     const token = this.tokenService.getAuthToken();
//     const user = jwtDecode(token) as User;
//     return this.userSubject$.next(user);
//   }
//
//   public getUser(): Observable<User | null> {
//     return this.userSubject$.asObservable();
//   }
//
//   public saveToken(token: string): void {
//     this.tokenService.setAuthToken(token);
//     this.decodeJWT();
//   }
//
//   public logout(): void {
//     this.tokenService.removeAuthToken();
//     this.userSubject$.next(null);
//   }
//
//   public isLoggedIn(): boolean {
//     return this.tokenService.hasAuthToken();
//   }
//
//
//   recuperarSenha(identificacao: string): Observable<void> {
//     return this.httpClient.post<void>(
//       `${environment.apiUrl}/v1/auth/recuperar-senha`,
//       { identificacao },
//       { headers: { skip: 'true' }}
//     );
//   }
//
//   verificarCodigoRecuperacaoSenha(dados: { codigo: string, email: string}): Observable<boolean> {
//     return this.httpClient.post<boolean>(
//       `${environment.apiUrl}/v1/auth/verificar-codigo`,
//       dados,
//       { headers: { skip: 'true' }});
//   }
//
//   alterarSenha(dados: { senha: string, confirmarSenha: string}): Observable<boolean> {
//     return this.httpClient.post<boolean>(
//       `${environment.apiUrl}/v1/auth/alterar-senha`,
//       dados,
//       { headers: { skip: 'true' }});
//   }
// }
