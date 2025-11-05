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
    label: 'Administração',
    classIcon: 'bi bi-shield-lock-fill',
    path: '/administracao',
    items: [
      {
        label: 'Pessoas',
        exactPath: '/administracao/pessoas',
      },
      {
        label: 'Setores e Ambientes',
        exactPath: '/administracao/setores',
      },
      {
        label: 'Cursos',
        exactPath: '/administracao/cursos',
      },
      {
        label: 'Feriados',
        exactPath: '/administracao/feriados',
      },
      {
        label: 'Semestres',
        exactPath: '/administracao/gerenciamento-de-semestre',
      },
      {
       label: 'Cargos',
       exactPath: '/administracao/cargos',
      },
      {
        label: 'Grupos de Acesso',
        exactPath: '/administracao/grupo-acesso',
      },
      {
        label: 'Links Externos',
        exactPath: '/administracao/links-externos',
      },
      {
        label: 'Datas Institucionais',
        exactPath: '/administracao/datas-institucionais',
      },
      {
        label: 'Calendário Acadêmico',
        exactPath: '/administracao/calendario-semestral',
      },
      {
        label: 'Termos de Uso',
        exactPath: '/administracao/termos-uso',
      },
      {
        label: 'Aniversariantes',
        exactPath: '/administracao/aniversariantes',
      },
    ],
  },
  {
    label: 'Frequência',
    classIcon: 'bi bi-calendar2',
    path: '/frequencia',
    items: [
      {
        label: 'Folha de Pagamento',
        exactPath: '/frequencia/folha-pagamento',
      },
      {
        label: 'Projetos',
        exactPath: '/frequencia/projetos',
      },
      {
        label: 'Relatórios',
        exactPath: '/frequencia/relatorios',
      },
      {
        label: 'Carga horária',
        exactPath: '/frequencia/carga-horaria',
      },
    ],
  },
  {
    label: 'Notificações',
    classIcon: 'bi bi-bell-fill',
    path: '/notificacoes',
    items: [
      {
        label: 'Enviadas',
        exactPath: '/notificacoes/enviadas',
      },
      {
        label: 'Pendentes',
        exactPath: '/notificacoes/pendentes',
      },
    ],
  },
  {
    label: 'Recepção',
    classIcon: 'bi bi-window-sidebar',
    path: '/recepcao',
    items: [
      {
        label: 'Consultar trânsito',
        exactPath: '/recepcao/consultar-transito',
      },
      {
        label: 'Fluxo em Tempo Real',
        exactPath: '/recepcao/fluxo-tempo-real',
      },
      {
        label: 'Configurações',
        exactPath: '/recepcao/configuracoes',
      },
    ],
  },
  {
    label: 'Requisições',
    classIcon: 'bi bi-file-text',
    path: '/requisicoes',
    items: [
      {
        label: 'Minhas Requisições',
        exactPath: '/requisicoes/requisicoes-solicitadas',
      },
        {
        label: 'Gerenciar Requisições',
        exactPath: '/requisicoes/avaliar-requisicoes-solicitadas',
      },
    ],
  },
  {
    label: 'Avisos',
    classIcon: 'bi bi-collection',
    path: '/avisos',
    items: [
      {
        label: 'Controle de Avisos',
        exactPath: '/avisos/controle-avisos'
      },
      {
        label: 'Painel de Avisos',
        exactPath: '/avisos/painel-avisos'
      },
      {
        label: 'Configurações',
        exactPath: '/avisos/configuracoes-avisos'
      }
    ]
  },
  {
    label: 'Restaurante',
    classIcon: 'bi bi-clipboard',
    path: '/restaurante',
    items: [
      {
        label: 'Cardápio',
        exactPath: '/restaurante/cardapio',
      },
    ],
  },
  {
    label: 'Chaves',
    classIcon: 'bi bi-key-fill',
    path: '/chaves',
    items: [
      {
        label: 'Gerenciamento de Chaves',
        exactPath: '/chaves/gerenciamento',
      },
      {
        label: 'Devolução de Chaves',
        exactPath: '/chaves/devolucao',
      },
      {
        label: 'Histórico de Chaves',
        exactPath: '/chaves/historico',
      },
    ],
  },
  {
    label: 'Ramais',
    classIcon: 'bi bi-telephone-fill',
    path: '/ramais',
  },
];
