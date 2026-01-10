import { CurrencyPipe, DecimalPipe, NgOptimizedImage } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { DashboardService } from '@modules/initial-page/services/dashboard.service';
import { CategoryService } from '@modules/transactions/services/category.service';
import { BarChartComponent } from '@shared/components/charts/bar-chart/bar-chart.component';
import { CategoryDetailsComponent } from '@shared/components/category-details/category-details.component';
import { PageContainerComponent } from '@shared/components/page-container/page-container.component';
import { ModalAlertService } from '@shared/components/swall/modal-alert/service/modal-alert.service';
import {
  ICategoryItem,
  IChartData,
  IDashboard,
  IExpenseCategory,
  IFinancialSummary,
  IFinancialSummaryCard,
} from '@shared/interfaces/dashboard.interface';
import { LoadingService } from '@shared/layouts/default-layout/loading.service';
import { Chart, ChartOptions, registerables } from 'chart.js';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale/pt-BR';
import { BaseChartDirective } from 'ng2-charts';
import { BsModalService } from 'ngx-bootstrap/modal';
import { forkJoin, Subscription } from 'rxjs';

@Component({
  selector: 'zen-home-dashboard',
  standalone: true,
  templateUrl: './home-dashboard.component.html',
  imports: [
    PageContainerComponent,
    CurrencyPipe,
    NgOptimizedImage,
    BarChartComponent,
    CategoryDetailsComponent,
    BaseChartDirective,
  ],
  styleUrl: './home-dashboard.component.scss',
})
export class HomeDashboardComponent implements OnInit, OnDestroy {
  categories: IExpenseCategory[] = [];
  currentCategories: IExpenseCategory[] = [];
  previousCategories: IExpenseCategory[] = [];

  financialSummary: IFinancialSummaryCard[] = [];

  dashboard: IDashboard = {} as IDashboard;

  currentDashboard!: IDashboard;
  previousDashboard!: IDashboard;
  currentPeriod = '';

  pieChartData!: IChartData;
  barChartData!: IChartData;

  comparisonChartData = signal<IChartData>({} as IChartData);
  chartOptions = signal<ChartOptions<'bar'>>({
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: string | number) {
            if (typeof value === 'number') {
              return new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(value);
            }
            return value;
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            let label = context.datasets?.label || '';
            if (label) {
              label += ': ';
            }
            label += new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(context.raw);
            return label;
          },
        },
      },
    },
  });
  isLoading = true;
  hasError = false;

  get currentPeriodDisplay() {
    const currentPeriod = this.dashboardService.getCurrentYearMonth(this.currentPeriod);
    return this.formatPeriodDisplay(currentPeriod).toUpperCase();
  }

  get previousPeriodDisplay() {
    const previousPeriod = this.dashboardService.getPreviousYearMonth(this.currentPeriod);
    return this.formatPeriodDisplay(previousPeriod).toUpperCase();
  }

  get nextPeriodDisplay() {
    const nextPeriod = this.dashboardService.getNextYearMonth(this.currentPeriod);
    return this.formatPeriodDisplay(nextPeriod).toUpperCase();
  }

  private subscriptions = new Subscription();

  private readonly fb = inject(FormBuilder);
  private readonly modalService = inject(BsModalService);
  protected readonly dashboardService = inject(DashboardService);
  private readonly categoryService = inject(CategoryService);
  private readonly loadingService = inject(LoadingService);
  private readonly modalAlertService = inject(ModalAlertService);

  constructor() {
    this.loadingService.onActiveLoading();
  }

  ngOnInit() {
    Chart.register(...registerables);
    this.loaderDashboard();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.dashboardService.clearCache();
  }

  loaderDashboard() {
    this.hasError = false;
    this.loadingService.onActiveLoading();

    const loadSub = forkJoin({
      comparative: this.dashboardService.getComparativeDashboards(),
      current: this.dashboardService.getCurrentMonthDashboard(),
    }).subscribe({
      next: ({ comparative, current }) => {
        this.currentDashboard = comparative.current;
        this.previousDashboard = comparative.previous;
        this.currentPeriod = comparative.current.period;

        this.processDashboardData(current);

        this.prepareComparisonData(comparative.current, comparative.previous);
        this.isLoading = false;
        this.loadingService.onInactiveLoading();
      },
      error: error => {
        console.error('Erro ao carregar dashboard:', error);
        this.hasError = true;
        this.isLoading = false;
        this.loadingService.onInactiveLoading();
      },
    });

    this.subscriptions.add(loadSub);
  }

  private processDashboardData(dashboard: IDashboard) {
    this.categories = this.convertToExpenseCategory(dashboard.categories.expense);
    this.financialSummary = this.prepareFinancialSummaryCards(dashboard.summary);

    this.prepareChartData(dashboard);
  }

  private prepareCategoryComparison(current: IDashboard, previous: IDashboard) {
    this.currentCategories = this.convertToExpenseCategory(current.categories.expense);
    this.previousCategories = this.convertToExpenseCategory(previous.categories.expense);
    this.normalizeCategories();
  }

  private normalizeCategories() {
    const allCategoryIds = new Set([
      ...this.currentCategories.map(c => c.id),
      ...this.previousCategories.map(c => c.id),
    ]);

    // Para cada categoria que existe em um mês mas não no outro,
    // adiciona com valor 0
    allCategoryIds.forEach(categoryId => {
      // Verifica se existe no mês atual
      if (!this.currentCategories.find(c => c.id === categoryId)) {
        const prevCategory = this.previousCategories.find(c => c.id === categoryId);
        if (prevCategory) {
          this.currentCategories.push({
            ...prevCategory,
            actual: 0,
            estimated: 0,
            percentage: 0,
            transactionCount: 0,
          });
        }
      }

      // Verifica se existe no mês anterior
      if (!this.previousCategories.find(c => c.id === categoryId)) {
        const currentCategory = this.currentCategories.find(c => c.id === categoryId);
        if (currentCategory) {
          this.previousCategories.push({
            ...currentCategory,
            actual: 0,
            estimated: 0,
            percentage: 0,
            transactionCount: 0,
          });
        }
      }
    });

    // Ordena por valor atual (decrescente)
    this.currentCategories.sort((a, b) => b.actual - a.actual);
    this.previousCategories.sort((a, b) => {
      const aIndex = this.currentCategories.findIndex(c => c.id === a.id);
      const bIndex = this.currentCategories.findIndex(c => c.id === b.id);
      return aIndex - bIndex;
    });
  }

  private prepareComparisonData(current: IDashboard, previous: IDashboard) {
    this.comparisonChartData.set(
      this.dashboardService.prepareComparisonChartData(current, previous)
    );
    this.updateFinancialSummaryWithComparison(current, previous);
    this.prepareCategoryComparison(current, previous);
  }

  private prepareChartData(dashboard: IDashboard) {
    this.pieChartData = {
      labels: dashboard.categories.expense.map(c => c.name),
      datasets: [
        {
          data: dashboard.categories.expense.map(c => c.actual),
          backgroundColor: dashboard.categories.expense.map(c => c.color),
          borderWidth: 1,
        },
      ],
    };

    this.barChartData = {
      labels: dashboard.categories.expense.map(c => c.name),
      datasets: [
        {
          label: 'Realizado',
          data: dashboard.categories.expense.map(c => c.actual),
          backgroundColor: dashboard.categories.expense.map(c => c.color + 'CC'),
          borderColor: dashboard.categories.expense.map(c => c.color),
          borderWidth: 1,
        },
        {
          label: 'Estimado',
          data: dashboard.categories.expense.map(c => c.estimated),
          backgroundColor: dashboard.categories.expense.map(c => this.lightenColor(c.color, 0.7)),
          borderColor: dashboard.categories.expense.map(c => c.color),
          borderWidth: 1,
          borderDash: [5, 5],
        },
      ],
    };
  }

  private updateFinancialSummaryWithComparison(current: IDashboard, previous: IDashboard) {
    this.financialSummary = [
      {
        title: 'Saldo Total',
        value: current.summary.balance.actual,
        icon: 'icons/coin.png',
        iconColor: this.getIconColor(current.summary.balance.changePercentage, false, 'info'),
        percentage: this.formatChangePercentage(
          current.summary.balance.changePercentage,
          current.summary.balance.progress
        ),
        percentageColor: this.getPercentageColor(
          current.summary.balance.changePercentage,
          false,
          'info'
        ),
      },
      {
        title: 'Renda Mensal',
        value: current.summary.income.actual,
        icon: 'icons/arrow-up.png',
        iconColor: this.getIconColor(current.summary.income.changePercentage, false, 'success'),
        percentage: this.formatChangePercentage(
          current.summary.income.changePercentage,
          current.summary.income.progress
        ),
        percentageColor: this.getPercentageColor(
          current.summary.income.changePercentage,
          false,
          'success'
        ),
      },
      {
        title: 'Despesas Mensal',
        value: current.summary.expense.actual,
        icon: 'icons/arrow-down.png',
        iconColor: this.getIconColor(current.summary.expense.changePercentage, true, 'danger'),
        percentage: this.formatChangePercentage(
          current.summary.expense.changePercentage,
          current.summary.expense.progress
        ),
        percentageColor: this.getPercentageColor(
          current.summary.expense.changePercentage,
          true,
          'danger'
        ),
      },
    ];
  }

  private convertToExpenseCategory(categories: ICategoryItem[]): IExpenseCategory[] {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      color: category.color,
      actual: category.actual,
      percentage: category.percentage,
      estimated: category.estimated,
      transactionCount: category.transactionCount,
      transactions: category.transactions,
    }));
  }

  private prepareFinancialSummaryCards(summary: IFinancialSummary): IFinancialSummaryCard[] {
    return this.dashboardService.prepareFinancialSummaryCards({ summary } as IDashboard);
  }

  private formatChangePercentage(changePercentage: number, progress: number): string {
    const changeText =
      changePercentage !== 0
        ? `${changePercentage > 0 ? '+' : ''}${changePercentage.toFixed(1)}% vs mês anterior`
        : 'Sem mudança vs mês anterior';

    const progressText = ` (${progress.toFixed(1)}% da meta)`;

    return changeText + progressText;
  }

  private getIconColor(
    changePercentage: number,
    isExpense = false,
    defaultColor: 'danger' | 'success' | 'info' = 'info'
  ): 'danger' | 'success' | 'info' {
    if (isExpense) {
      return changePercentage > 0 ? 'danger' : changePercentage < 0 ? 'success' : defaultColor;
    } else {
      return changePercentage > 0 ? 'success' : changePercentage < 0 ? 'danger' : defaultColor;
    }
  }

  private getPercentageColor(
    changePercentage: number,
    isExpense = false,
    defaultColor: 'danger' | 'success' | 'info' = 'info'
  ): 'danger' | 'success' | 'info' {
    return this.getIconColor(changePercentage, isExpense, defaultColor);
  }

  private lightenColor(color: string, factor: number): string {
    // Implementação simples para clarear cores hex
    if (color.startsWith('#')) {
      const num = parseInt(color.slice(1), 16);
      const r = Math.min(255, (num >> 16) + factor * 255);
      const g = Math.min(255, ((num >> 8) & 0x00ff) + factor * 255);
      const b = Math.min(255, (num & 0x0000ff) + factor * 255);
      return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
    return color;
  }

  reload() {
    this.dashboardService.clearCache();
    this.loaderDashboard();
  }

  /**
   * Navega para o mês anterior
   */
  goToPreviousMonth(): void {
    const currentPeriod = this.dashboardService.navigateMonth(this.currentPeriod, 'prev');
    this.loadDashboardForPeriod(currentPeriod);
  }

  /**
   * Navega para o mês seguinte
   */
  goToNextMonth(): void {
    const currentPeriod = this.dashboardService.navigateMonth(this.currentPeriod, 'next');
    this.loadDashboardForPeriod(currentPeriod);
  }

  /**
   * Carrega dashboard para um período específico
   */
  loadDashboardForPeriod(yearMonth: string): void {
    //this.isLoading = true;
    //this.loadingService.onActiveLoading();
    const { month, year } = this.dashboardService.parseYearMonth(yearMonth);

    const sub = this.dashboardService.getDashboard({ month, year }).subscribe({
      next: dashboard => {
        this.currentDashboard = dashboard;
        this.currentPeriod = dashboard.period;
        this.processDashboardData(dashboard);

        // Carrega mês anterior para comparação
        const previousPeriod = this.dashboardService.navigateMonth(yearMonth, 'prev');
        const { month, year } = this.dashboardService.parseYearMonth(previousPeriod);

        this.dashboardService.getDashboard({ month, year }).subscribe(prev => {
          this.previousDashboard = prev;
          this.prepareComparisonData(dashboard, prev);
          this.isLoading = false;
          this.loadingService.onInactiveLoading();
        });
      },
      error: error => {
        console.error('Erro ao carregar dashboard:', error);
        this.isLoading = false;
        this.loadingService.onInactiveLoading();
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Formata período para exibição
   */
  formatPeriodDisplay(yearMonth: string): string {
    if (!yearMonth) return '';
    try {
      const [month, year] = yearMonth.split('/');
      const date = new Date(Number(year), Number(month) - 1, 1);
      return format(date, 'MMM/yyyy', { locale: ptBR });
    } catch {
      return yearMonth;
    }
  }

  /**
   * Formata valor monetário
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
