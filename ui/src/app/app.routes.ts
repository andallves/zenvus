import {Title} from '@angular/platform-browser';
import {Routes, TitleStrategy} from '@angular/router';
import {JWT_OPTIONS, JwtHelperService} from '@auth0/angular-jwt';
import {AuthGuard} from '@core/guards/auth.guard';
import {TemplatePageTitleStrategy} from '@core/strategies/template-page-title.strategy ';
import {AuthLayoutComponent} from '@shared/layouts/auth-layout/auth-layout.component';
import {DefaultLayoutComponent} from '@shared/layouts/default-layout/default-layout.component';

const publicRoutes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./modules/auth/auth.module').then((m) => m.AuthModule),
  },
];

const protectedRoutes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(m => m.HomeDashboardComponent),
      }
    ]
  }
];

export const providers = [
  JwtHelperService,
  {
    provide: JWT_OPTIONS,
    useValue: JWT_OPTIONS,
  },
  Title,
  {
    provide: TitleStrategy,
    useClass: TemplatePageTitleStrategy
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

