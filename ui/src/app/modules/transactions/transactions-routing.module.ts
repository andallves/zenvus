import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const transactionsRoutes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'receitas',
        title: 'Receitas',
        data: { description: 'Cadastre, edite, exclua ou consulte as receitas.' },
        loadComponent: () => import('./pages/income/income.component').then(m => m.IncomeComponent),
      },
      {
        path: 'despesas',
        title: 'Despesas',
        data: {
          description: 'Cadastre, edite, exclua ou consulte as despesas.',
        },
        loadComponent: () =>
          import('./pages/expense/expense.component').then(m => m.ExpenseComponent),
      },
      {
        path: 'categorias',
        title: 'Categorias',
        data: { description: 'Cadastre, edite, exclua ou consulte as categorias.' },
        loadComponent: () =>
          import('./pages/category/category.component').then(m => m.CategoryComponent),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(transactionsRoutes)],
  exports: [RouterModule],
})
export class TransactionsRoutingModule {}
