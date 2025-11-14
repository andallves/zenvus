import { Title } from '@angular/platform-browser';
import { Routes, TitleStrategy } from '@angular/router';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { authGuard } from '@core/guards/auth.guard';
import { TemplatePageTitleStrategy } from '@core/strategies/template-page-title.strategy';
import { AuthLayoutComponent } from '@shared/layouts/auth-layout/auth-layout.component';
import { DefaultLayoutComponent } from '@shared/layouts/default-layout/default-layout.component';

const protectedChildren: Routes = [
  {
    path: '',
    title: 'Início',
    data: { description: 'Página inicial do sistema' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: 'transacoes',
    title: 'Transações',
    data: { description: 'Página de visualização de históricos e gerenciamento das transações' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: 'orcamentos',
    title: 'Orçamentos',
    data: { description: 'Página de orçamentos' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: 'metas',
    title: 'Metas',
    data: { description: 'Página de metas financeiras' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: 'analises',
    title: 'Análises',
    data: { description: 'Página de análises financeiras' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
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
    useClass: TemplatePageTitleStrategy,
  },
];

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule),
  },
  {
    path: '',
    component: DefaultLayoutComponent,
    canActivateChild: [authGuard],
    children: protectedChildren,
  },
];
