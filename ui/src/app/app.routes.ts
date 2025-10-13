import { Routes } from '@angular/router';
import {JWT_OPTIONS, JwtHelperService} from '@auth0/angular-jwt';
import {AuthGuard} from '@core/guards/auth.guard';
import {AuthLayoutComponent} from '@shared/layouts/auth-layout/auth-layout.component';

const publicRoutes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
];

const protectedRoutes: Routes = [

];

export const providers = [
  JwtHelperService,
  {
    provide: JWT_OPTIONS,
    useValue: JWT_OPTIONS,
  },
];
export const routes: Routes = [
  ...publicRoutes,
  {
    path: '',
    canActivate: [AuthGuard],
    children: protectedRoutes,
  },
];

