import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { SKIP_AUTH } from '@core/guards/http-context-tokens';
import { AuthTokenService } from '@core/services/auth-token/auth-token.service';
import { EMPTY, tap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.context.get(SKIP_AUTH)) {
    return next(req);
  }

  const authTokenService = inject(AuthTokenService);
  const token = authTokenService.getAccessToken();

  if (!token) {
    authTokenService.handleUnauthorized();
    return EMPTY;
  }

  const request = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(request).pipe(
    tap({
      error: (err: Error) => {
        if (err instanceof HttpErrorResponse) {
          if (err.status !== 401) {
            return;
          }
          authTokenService.handleUnauthorized();
        }
      },
    })
  );
};
