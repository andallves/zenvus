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
    path: 'receitas',
    title: 'Receitas',
    data: { description: 'Página de gerenciamento e visualização das receitas.' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: 'despesas',
    title: 'Despesas',
    data: { description: 'Página de gerenciamento e visualização das despesas.' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: 'categorias',
    title: 'Categorias',
    data: { description: 'Página de gerenciamento e visualização das despesas.' },
    loadComponent: () =>
      import('./modules/transactions/pages/category/category.component').then(
        m => m.CategoryComponent
      ),
  },
  {
    path: 'orcamentos',
    title: 'Orçamentos',
    data: { description: 'Página de gerenciamento de orçamentos' },
    loadComponent: () =>
      import('./modules/initial-page/pages/home-dashboard/home-dashboard.component').then(
        m => m.HomeDashboardComponent
      ),
  },
  {
    path: 'relatorios',
    title: 'Relatórios',
    data: { description: 'Página de relatórios financeiras' },
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
