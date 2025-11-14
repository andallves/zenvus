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
    label: 'Transações',
    classIcon: 'bi bi-arrow-left-right',
    path: '/transacoes',
  },
  {
    label: 'Orçamentos',
    classIcon: 'bi bi-coin',
    path: '/orcamentos',
  },
  {
    label: 'Metas',
    classIcon: 'bi bi-piggy-bank',
    path: '/metas',
  },
  {
    label: 'Análises',
    classIcon: 'bi bi-graph-up',
    path: '/analises',
  },
];
