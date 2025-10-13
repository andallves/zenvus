import { Routes } from '@angular/router';
import {AuthLayoutComponent} from '@shared/layouts/auth-layout/auth-layout.component';

const publicRoutes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
];
export const routes: Routes = [
  ...publicRoutes,
];

