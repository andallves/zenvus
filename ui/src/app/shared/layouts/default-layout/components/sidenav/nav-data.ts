export interface SidenavMenuItems {
  label: string;
  exactPath: string;
}

export interface SidenavMenu {
  label: string;
  path: string;
  classIcon: string;
  items?: SidenavMenuItems[];
}

export const navbarData: SidenavMenu[] = [
  {
    label: 'Início',
    path: '',
    classIcon: 'bi bi-highlights',
  },
  {
    label: 'Receitas',
    classIcon: 'bi bi-arrow-up-right-circle',
    path: '/receitas',
  },
  {
    label: 'Despesas',
    classIcon: 'bi bi-arrow-down-left-circle',
    path: '/despesas',
  },
  {
    label: 'Categorias',
    classIcon: 'bi bi-tag',
    path: '/categorias',
  },
  {
    label: 'Orçamentos',
    classIcon: 'bi bi-coin',
    path: '/orcamentos',
  },
  {
    label: 'Relatórios',
    classIcon: 'bi bi-pie-chart',
    path: '/relatorios',
  },
];
