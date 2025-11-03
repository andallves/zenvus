import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';

export const refreshTokenInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.get('skip')) {
    return next(req);
  }

  // Verifica se o token está próximo de expirar ou expirado, se não estiver joga a request para frente.
  if (!verificaSeTokenEstaProxHaExpirarOuExpirado()) {
    return next(req);
  }

  const helper = new JwtHelperService();
  const router = inject(Router);
  const authTokenService = inject(AuthTokenService);
  const refreshToken = localStorage.getItem('refreshToken');
  // Verifica se o refresh token ainda é válido, caso não seja limpa os dados de token do storage
  // e redireciona para a página de login

  if (refreshToken === null || refreshToken.length === 0 || helper.isTokenExpired(refreshToken)) {
    authTokenService.clearTokenFromStorage();
    router
      .navigate(['auth/login'], {
        queryParams: { returnUrl: router.url },
      })
      .then();

    return EMPTY;
  }

  // Renova o access token
  return authTokenService.refreshToken(refreshToken).pipe(
    // Se houver erro por o token está inválido limpas os dados e redireciona para o login
    catchError(() => {
      authTokenService.clearTokenFromStorage();
      router
        .navigate(['auth/login'], {
          queryParams: { returnUrl: router.url },
        })
        .then();
      return EMPTY;
    }),
    // Seta os dados no storage e joga a request para frente
    tap(token => authTokenService.setTokenInStorage(token)),
    switchMap(() => {
      return next(req);
    })
  );
};

const verificaSeTokenEstaProxHaExpirarOuExpirado = (): boolean => {
  const token = sessionStorage.getItem('accessToken');
  if (!token) {
    return true;
  }
  const helper = new JwtHelperService();
  const decoded = helper.decodeToken(token);

  if (!decoded) {
    return true;
  }

  if (helper.isTokenExpired(token)) {
    return true;
  }

  const expiraEm = new Date(decoded.exp * 1000);
  return diffMinutes(new Date(), expiraEm) <= 5;
};

const diffMinutes = (dt2: Date, dt1: Date): number => {
  // Calculate the difference in milliseconds between the two provided dates and convert it to seconds
  let diff = (dt2.getTime() - dt1.getTime()) / 1000;
  // Convert the difference from seconds to minutes
  diff /= 60;
  // Return the absolute value of the rounded difference in minutes
  return Math.abs(Math.round(diff));
};
