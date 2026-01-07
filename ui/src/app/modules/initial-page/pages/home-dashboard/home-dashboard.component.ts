import { CurrencyPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DashboardService } from '@modules/initial-page/services/dashboard.service';
import { CategoryService } from '@modules/transactions/services/category.service';
import { BarChartComponent } from '@shared/components/bar-chart/bar-chart.component';
import { CategoryDetailsComponent } from '@shared/components/category-details/category-details.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { PieChartComponent } from '@shared/components/pie-chart/pie-chart.component';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {
  ICategoryItem,
  IDashboard,
  IDashboardFilter,
  IExpenseCategory,
} from '@shared/interfaces/dashboard.interface';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'zen-home-dashboard',
  standalone: true,
  templateUrl: './home-dashboard.component.html',
  imports: [
    PageContainerComponent,
    CurrencyPipe,
    NgOptimizedImage,
    PieChartComponent,
    BarChartComponent,
    CategoryDetailsComponent,
    DecimalPipe,
  ],
  styleUrl: './home-dashboard.component.scss',
})
export class HomeDashboardComponent implements OnInit {
  categories: IExpenseCategory[] = [];
  dashboard: IDashboard = {} as IDashboard;
  financialSummary = [
    {
      title: 'Saldo Total',
      value: 3749.45,
      icon: 'icons/wallet.png',
      iconColor: 'danger',
      percentage: '+2.5% em relação ao mês passado',
      percentageColor: 'success',
    },
    {
      title: 'Renda Mensal',
      value: 3749.45,
      icon: 'icons/arrow-up.png',
      iconColor: 'success',
      percentage: '+2.5% em relação ao mês passado',
      percentageColor: 'success',
    },
    {
      title: 'Despesas Mensal',
      value: 3749.45,
      icon: 'icons/arrow-down.png',
      iconColor: 'danger',
      percentage: '+2.5% em relação ao mês passado',
      percentageColor: 'success',
    },
    {
      title: 'Saldo Liquido',
      value: 3749.45,
      icon: 'icons/coin.png',
      iconColor: 'info',
      percentage: '+2.5% em relação ao mês passado',
      percentageColor: 'success',
    },
  ];

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(BsModalService);
  private readonly dashboardService = inject(DashboardService);
  private readonly categoryService = inject(CategoryService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalAlertService = inject(ModalAlertService);

  ngOnInit() {
    this.loaderSummary();

    // No componente que usa o pie-chart
    console.log('📊 Dados enviados para o gráfico:', this.categories);
    console.log('🔍 Primeira categoria:', this.categories[0]);
    console.log('💰 Tem campo actual?', 'actual' in this.categories[0]);
    console.log('🎨 Tem campo color?', 'color' in this.categories[0]);
  }
  loaderSummary() {
    const filter: IDashboardFilter = {
      month: '2025-12',
      year: null,
    };
    this.loadingService.onInactiveLoading();
    this.dashboardService.getSummary(filter).subscribe({
      next: dash => {
        this.dashboard = dash;
        this.categories = dash.categories.expense.map(category =>
          this.convertToExpenseCategory(category)
        );
        console.log(dash);
      },
    });
  }

  private convertToExpenseCategory(category: ICategoryItem): IExpenseCategory {
    return {
      id: category.id,
      name: category.name,
      color: category.color,
      actual: category.actual, // ou category.estimated dependendo do que você quer
      percentage: category.percentage,
      estimated: category.estimated,
      transactionCount: category.transactionCount,
    };
  }
}
