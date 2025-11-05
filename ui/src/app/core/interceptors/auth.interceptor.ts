import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { getSession } from '@core/adapters/cache.adapter';
import { ACCESS_TOKEN, AuthTokenService } from '@core/services/auth-token/auth-token.service';
import { EMPTY, tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.headers.get('skip')) {
    return next(req);
  }

  const router = inject(Router);
  const authTokenService = inject(AuthTokenService);
  const token = getSession({ key: ACCESS_TOKEN });

  // se não houver token garante que não haverá mais nenhum dado de token e redireciona para login
  console.log(token);
  if (!token) {
    authTokenService.clearTokenFromStorage();
    router
      .navigate(['auth/login'], {
        queryParams: { returnUrl: router.url },
      })
      .then();

    return EMPTY;
  }

  // Se houver token adiciona no header
  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    tap({
      // Se houver erro 401 na request limpa os dados de token e redireciona para o login
      error: (err: Error) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status !== 401) {
            return;
          }

          authTokenService.clearTokenFromStorage();

          // Send notification or pop to user to inform about te redirect
          router
            .navigate(['auth/login'], {
              queryParams: { returnUrl: router.url },
            })
            .then();
        }
      },
    })
  );
};
