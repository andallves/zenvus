import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '@core/services/base.service';
import { EPaymentStatus } from '@shared/enums/payment-status.enum';
import { format, getMonth, getYear, subMonths } from 'date-fns';
import {
  IDashboard,
  IDashboardFilter,
  ICategoriesSummary,
  IDashboardCategory,
  IDebtSummary,
  IUpcomingInstallment,
  IMetric,
  IDashboardTotals,
  IChartData,
  IDashboardTransaction,
} from '@shared/interfaces/dashboard.interface';
import { catchError, forkJoin, map, Observable, of, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DashboardService extends BaseService {
  private cache = new Map<string, Observable<IDashboard>>();

  private formatYearMonth(month: number, year: number): string {
    const monthStr = month.toString().padStart(2, '0');
    return `${year}-${monthStr}`;
  }

  parseYearMonth(yearMonth: string): { month: number; year: number } {
    const [yearStr, monthStr] = yearMonth.split('-');
    return {
      year: parseInt(yearStr, 10),
      month: parseInt(monthStr, 10),
    };
  }

  getDashboard(filters: IDashboardFilter): Observable<IDashboard> {
    const currentDate = new Date();
    const targetMonth = filters.month || currentDate.getMonth() + 1;
    const targetYear = filters.year || currentDate.getFullYear();

    const cacheKey = this.formatYearMonth(targetMonth, targetYear);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const params = new HttpParams().set('Month', cacheKey).set('Year', targetYear);

    const request = this.httpClient
      .get<IDashboard>(`${this.apiUrl}/v1/dashboard/summary`, { params })
      .pipe(
        map(apiResponse => this.mapApiResponseToDashboard(apiResponse, targetMonth, targetYear)),
        catchError(error => {
          console.error('Erro ao carregar dashboard:', error);
          return of(this.getEmptyDashboard(targetMonth, targetYear));
        }),
        shareReplay(1)
      );

    this.cache.set(cacheKey, request);
    return request;
  }

  private mapApiResponseToDashboard(
    apiResponse: IDashboard,
    month: number,
    year: number
  ): IDashboard {
    return {
      period: this.formatYearMonth(month, year),
      totals: this.mapTotals(apiResponse.totals),
      categories: this.mapCategories(apiResponse.categories),
      debt: this.mapDebt(apiResponse.debt),
    };
  }

  private mapTotals(apiTotals?: IDashboardTotals): IDashboardTotals {
    if (!apiTotals) {
      return {
        income: this.getEmptyMetric(),
        expense: this.getEmptyMetric(),
        balance: this.getEmptyMetric(),
      };
    }

    return {
      income: this.mapMetric(apiTotals.income),
      expense: this.mapMetric(apiTotals.expense),
      balance: this.mapMetric(apiTotals.balance),
    };
  }

  private mapMetric(apiMetric?: IMetric): IMetric {
    if (!apiMetric) {
      return this.getEmptyMetric();
    }

    return {
      actual: apiMetric.actual || 0,
      estimated: apiMetric.estimated || 0,
      previous: apiMetric.previous || 0,
      difference:
        apiMetric.difference ||
        (apiMetric.estimated > 0 ? apiMetric.actual - apiMetric.estimated : 0),
      differenceFromPrevious: apiMetric.differenceFromPrevious || 0,
      progress: apiMetric.progress || 0,
      changePercentage: apiMetric.changePercentage || 0,
    };
  }

  private mapCategories(apiCategories?: ICategoriesSummary): ICategoriesSummary {
    if (!apiCategories) {
      return {
        income: [],
        expense: [],
      };
    }

    return {
      income: apiCategories.income?.map(c => this.mapCategory(c)) || [],
      expense: apiCategories.expense?.map(c => this.mapCategory(c)) || [],
    };
  }

  private mapCategory(apiCategory: IDashboardCategory): IDashboardCategory {
    return {
      id: apiCategory.id,
      name: apiCategory.name,
      color: apiCategory.color,
      actual: apiCategory.actual || 0,
      actualPaid: apiCategory.actualPaid || 0,
      estimated: apiCategory.estimated || 0,
      percentage: apiCategory.percentage || 0,
      transactionCount: apiCategory.transactionCount || 0,
      transactions: apiCategory.transactions?.map(t => this.mapTransaction(t)) || [],
    };
  }

  private mapTransaction(apiTransaction: IDashboardTransaction): IDashboardTransaction {
    return {
      id: apiTransaction.id,
      description: apiTransaction.description,
      amount: apiTransaction.amount,
      amountPaid: apiTransaction.amountPaid || 0,
      date: apiTransaction.date,
      status: apiTransaction.status,
      type: apiTransaction.type,
      hasDebt: apiTransaction.hasDebt || false,
      isInstallment: apiTransaction.isInstallment || false,
      installmentNumber: apiTransaction.installmentNumber,
    };
  }

  private mapDebt(apiDebt?: IDebtSummary): IDebtSummary {
    if (!apiDebt) {
      return this.getEmptyDebtSummary();
    }

    return {
      totalDebt: apiDebt.totalDebt || 0,
      paidAmount: apiDebt.paidAmount || 0,
      remainingAmount: apiDebt.remainingAmount || 0,
      totalInstallments: apiDebt.totalInstallments || 0,
      paidInstallments: apiDebt.paidInstallments || 0,
      overdueInstallments: apiDebt.overdueInstallments || 0,
      upcomingInstallments:
        apiDebt.upcomingInstallments?.map(i => this.mapUpcomingInstallment(i)) || [],
    };
  }

  private mapUpcomingInstallment(apiInstallment: IUpcomingInstallment): IUpcomingInstallment {
    return {
      id: apiInstallment.id,
      number: apiInstallment.number,
      dueDate: new Date(apiInstallment.dueDate),
      amount: apiInstallment.amount,
      isOverdue: apiInstallment.isOverdue || false,
      description: apiInstallment.description,
    };
  }

  getCurrentMonthDashboard(): Observable<IDashboard> {
    const currentDate = new Date();
    return this.getDashboard({
      month: getMonth(currentDate) + 1,
      year: getYear(currentDate),
    });
  }

  getPreviousMonthDashboard(): Observable<IDashboard> {
    const currentDate = new Date();
    const previousMonthDate = subMonths(currentDate, 1);
    return this.getDashboard({
      month: getMonth(previousMonthDate) + 1,
      year: getYear(previousMonthDate),
    });
  }

  getComparativeDashboards(): Observable<{
    current: IDashboard;
    previous: IDashboard;
  }> {
    return forkJoin({
      current: this.getCurrentMonthDashboard(),
      previous: this.getPreviousMonthDashboard(),
    });
  }

  private formatPeriodDisplay(month: number, year: number): string {
    const date = new Date(year, month - 1, 1);
    return format(date, 'MM/yyyy');
  }

  getCurrentYearMonth(currentPeriod: string): string {
    const { month, year } = this.parseYearMonth(currentPeriod);
    const date = new Date(year, month - 1, 1);
    return this.formatPeriodDisplay(getMonth(date) + 1, getYear(date));
  }

  getPreviousYearMonth(currentPeriod: string): string {
    const { month, year } = this.parseYearMonth(currentPeriod);
    const date = new Date(year, month - 1, 1);
    const previousMonthDate = subMonths(date, 1);
    return this.formatPeriodDisplay(getMonth(previousMonthDate) + 1, getYear(previousMonthDate));
  }

  getNextYearMonth(currentPeriod: string): string {
    const { month, year } = this.parseYearMonth(currentPeriod);
    const date = new Date(year, month - 1, 1);
    const nextMonthDate = subMonths(date, -1);
    return this.formatPeriodDisplay(getMonth(nextMonthDate) + 1, getYear(nextMonthDate));
  }

  getPreviousYearMonths(count: number): string[] {
    const result: string[] = [];
    const currentDate = new Date();

    for (let i = 0; i < count; i++) {
      const date = subMonths(currentDate, i);
      const monthStr = this.formatYearMonth(getMonth(date) + 1, getYear(date));
      result.push(monthStr);
    }

    return result;
  }

  private getEmptyMetric(): IMetric {
    return {
      actual: 0,
      estimated: 0,
      previous: 0,
      difference: 0,
      differenceFromPrevious: 0,
      progress: 0,
      changePercentage: 0,
    };
  }

  private getEmptyDebtSummary(): IDebtSummary {
    return {
      totalDebt: 0,
      paidAmount: 0,
      remainingAmount: 0,
      totalInstallments: 0,
      paidInstallments: 0,
      overdueInstallments: 0,
      upcomingInstallments: [],
    };
  }

  private getEmptyDashboard(month?: number, year?: number): IDashboard {
    const currentDate = new Date();
    const targetMonth = month || getMonth(currentDate) + 1;
    const targetYear = year || getYear(currentDate);

    return {
      period: this.formatYearMonth(targetMonth, targetYear),
      totals: {
        income: this.getEmptyMetric(),
        expense: this.getEmptyMetric(),
        balance: this.getEmptyMetric(),
      },
      categories: {
        income: [],
        expense: [],
      },
      debt: this.getEmptyDebtSummary(),
    };
  }

  prepareComparisonChartData(
    currentDashboard: IDashboard,
    previousDashboard?: IDashboard
  ): IChartData {
    if (!previousDashboard) {
      return {
        labels: ['Renda', 'Despesas', 'Saldo'],
        datasets: [
          {
            label: 'Mês Atual',
            data: [
              currentDashboard.totals.income.actual,
              currentDashboard.totals.expense.actual,
              currentDashboard.totals.balance.actual,
            ],
            backgroundColor: ['#B90504'],
          },
        ],
      };
    }

    return {
      labels: ['Renda', 'Despesas', 'Saldo'],
      datasets: [
        {
          label: 'Mês Anterior',
          data: [
            previousDashboard.totals.income.actual,
            previousDashboard.totals.expense.actual,
            previousDashboard.totals.balance.actual,
          ],
          backgroundColor: ['#ffae00'],
          borderColor: '#cc840a',
          borderWidth: 1,
        },
        {
          label: 'Mês Atual',
          data: [
            currentDashboard.totals.income.actual,
            currentDashboard.totals.expense.actual,
            currentDashboard.totals.balance.actual,
          ],
          backgroundColor: ['#B90504'],
          borderColor: '#970100',
          borderWidth: 1,
        },
      ],
    };
  }

  prepareFinancialSummaryCards(dashboard: IDashboard): {
    title: string;
    value: number;
    icon: string;
    iconColor: 'danger' | 'success' | 'info';
    percentage: string;
    percentageColor: 'danger' | 'success' | 'info';
  }[] {
    return [
      {
        title: 'Renda Total',
        value: dashboard.totals.income.actual,
        icon: 'trending-up',
        iconColor: this.getIconColor(dashboard.totals.income.changePercentage),
        percentage: `${dashboard.totals.income.changePercentage > 0 ? '+' : ''}${dashboard.totals.income.changePercentage.toFixed(1)}%`,
        percentageColor: this.getPercentageColor(dashboard.totals.income.changePercentage),
      },
      {
        title: 'Despesas Totais',
        value: dashboard.totals.expense.actual,
        icon: 'trending-down',
        iconColor: this.getIconColor(dashboard.totals.expense.changePercentage, true),
        percentage: `${dashboard.totals.expense.changePercentage > 0 ? '+' : ''}${dashboard.totals.expense.changePercentage.toFixed(1)}%`,
        percentageColor: this.getPercentageColor(dashboard.totals.expense.changePercentage, true),
      },
      {
        title: 'Saldo',
        value: dashboard.totals.balance.actual,
        icon: 'dollar-sign',
        iconColor: this.getIconColor(dashboard.totals.balance.changePercentage),
        percentage: `${dashboard.totals.balance.changePercentage > 0 ? '+' : ''}${dashboard.totals.balance.changePercentage.toFixed(1)}%`,
        percentageColor: this.getPercentageColor(dashboard.totals.balance.changePercentage),
      },
    ];
  }

  prepareCategoryChartData(
    categories: IDashboardCategory[],
    type: 'income' | 'expense'
  ): IChartData {
    const filteredCategories = categories.filter(c => c.actual > 0);

    if (filteredCategories.length === 0) {
      return {
        labels: ['Sem dados'],
        datasets: [
          {
            label: type === 'income' ? 'Receitas' : 'Despesas',
            data: [100],
            backgroundColor: ['#e0e0e0'],
          },
        ],
      };
    }

    return {
      labels: filteredCategories.map(c => c.name),
      datasets: [
        {
          label: type === 'income' ? 'Receitas' : 'Despesas',
          data: filteredCategories.map(c => c.actual),
          backgroundColor: filteredCategories.map(c => c.color || this.getRandomColor()),
          borderWidth: 1,
        },
      ],
    };
  }

  prepareDebtChartData(debtSummary: IDebtSummary): IChartData {
    const paidPercentage =
      debtSummary.totalDebt > 0 ? (debtSummary.paidAmount / debtSummary.totalDebt) * 100 : 0;
    const remainingPercentage = 100 - paidPercentage;

    return {
      labels: ['Pago', 'Pendente'],
      datasets: [
        {
          data: [paidPercentage, remainingPercentage],
          backgroundColor: ['#4CAF50', '#f44336'],
          borderWidth: 1,
        },
      ],
    };
  }

  getTransactionTypeIcon(transaction: IDashboardTransaction): string {
    if (transaction.status === EPaymentStatus.PAID) {
      return 'check-circle';
    } else if (transaction.status === EPaymentStatus.OVERDUE) {
      return 'alert-circle';
    } else if (transaction.hasDebt || transaction.isInstallment) {
      return 'repeat';
    } else {
      return 'calendar';
    }
  }

  getTransactionTypeColor(transaction: IDashboardTransaction): string {
    if (transaction.status === EPaymentStatus.PAID) {
      return 'success';
    } else if (transaction.status === EPaymentStatus.OVERDUE) {
      return 'danger';
    } else if (transaction.hasDebt || transaction.isInstallment) {
      return 'warning';
    } else {
      return 'primary';
    }
  }

  private getIconColor(changePercentage: number, isExpense = false): 'danger' | 'success' | 'info' {
    if (isExpense) {
      return changePercentage > 0 ? 'danger' : changePercentage < 0 ? 'success' : 'info';
    } else {
      return changePercentage > 0 ? 'success' : changePercentage < 0 ? 'danger' : 'info';
    }
  }

  private getPercentageColor(
    changePercentage: number,
    isExpense = false
  ): 'danger' | 'success' | 'info' {
    return this.getIconColor(changePercentage, isExpense);
  }

  private getRandomColor(): string {
    const colors = [
      '#B90504',
      '#ffae00',
      '#4CAF50',
      '#2196F3',
      '#9C27B0',
      '#FF9800',
      '#795548',
      '#607D8B',
      '#E91E63',
      '#00BCD4',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  clearCache(): void {
    this.cache.clear();
  }

  navigateMonth(yearMonth: string, direction: 'prev' | 'next'): string {
    const { month, year } = this.parseYearMonth(yearMonth);
    const date = new Date(year, month - 1, 1);

    const newDate = direction === 'prev' ? subMonths(date, 1) : subMonths(date, -1);

    return this.formatYearMonth(getMonth(newDate) + 1, getYear(newDate));
  }

  isValidYearMonth(yearMonth: string): boolean {
    try {
      const { month, year } = this.parseYearMonth(yearMonth);
      return month >= 1 && month <= 12 && year > 0;
    } catch {
      return false;
    }
  }

  getMonthsDifference(startYearMonth: string, endYearMonth: string): number {
    const start = this.parseYearMonth(startYearMonth);
    const end = this.parseYearMonth(endYearMonth);

    const startDate = new Date(start.year, start.month - 1, 1);
    const endDate = new Date(end.year, end.month - 1, 1);

    return (
      (endDate.getFullYear() - startDate.getFullYear()) * 12 +
      (endDate.getMonth() - startDate.getMonth())
    );
  }

  getMonthsBetween(startYearMonth: string, endYearMonth: string): string[] {
    const months: string[] = [];
    let current = startYearMonth;

    while (current !== endYearMonth) {
      months.push(current);
      current = this.navigateMonth(current, 'next');
    }
    months.push(endYearMonth);

    return months;
  }
}
