import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseService } from '@core/services/base.service';
import { format, getMonth, getYear, subMonths } from 'date-fns';
import {
  IChartData,
  IDashboard,
  IDashboardFilter,
  IFinancialMetric,
  IFinancialSummaryCard,
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

  parseYearMonth(year: string): { month: number; year: number } {
    const [yearStr, monthStr] = year.toString().split('-');
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

    const params = new HttpParams()
      .set('Month', this.formatYearMonth(targetMonth, targetYear))
      .set('Year', targetYear.toString());

    const request = this.httpClient
      .get<IDashboard>(`${this.apiUrl}/v1/dashboard/summary`, { params })
      .pipe(
        map(dashboard => this.enrichDashboardData(dashboard, targetMonth, targetYear)),
        catchError(error => {
          console.error('Erro ao carregar dashboard:', error);
          return of(this.getEmptyDashboard(targetMonth, targetYear));
        }),
        shareReplay(1)
      );

    this.cache.set(cacheKey, request);
    return request;
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

  private enrichDashboardData(dashboard: IDashboard, month: number, year: number): IDashboard {
    dashboard.period = this.formatYearMonth(month, year);

    // Se a API já retornou os dados do mês anterior, enriqueça as categorias
    if (dashboard.previousMonth && dashboard.categories) {
      this.enrichCategoriesWithPreviousData(dashboard);
    }

    if (dashboard.summary.income.progress === 0) {
      dashboard.summary.income.progress = this.calculateProgress(
        dashboard.summary.income.actual,
        dashboard.summary.income.estimated
      );
    }

    if (dashboard.summary.expense.progress === 0) {
      dashboard.summary.expense.progress = this.calculateProgress(
        dashboard.summary.expense.actual,
        dashboard.summary.expense.estimated
      );
    }

    if (dashboard.summary.balance.progress === 0) {
      dashboard.summary.balance.progress = this.calculateProgress(
        dashboard.summary.balance.actual,
        dashboard.summary.balance.estimated
      );
    }

    // Calcula changePercentage se não estiver calculado
    if (
      dashboard.summary.income.changePercentage === 0 &&
      dashboard.summary.comparison?.previousMonth?.income
    ) {
      dashboard.summary.income.changePercentage = this.calculatePercentageChange(
        dashboard.summary.income.actual,
        dashboard.summary.comparison.previousMonth.income
      );
    }

    if (
      dashboard.summary.expense.changePercentage === 0 &&
      dashboard.summary.comparison?.previousMonth?.expense
    ) {
      dashboard.summary.expense.changePercentage = this.calculatePercentageChange(
        dashboard.summary.expense.actual,
        dashboard.summary.comparison.previousMonth.expense
      );
    }

    if (
      dashboard.summary.balance.changePercentage === 0 &&
      dashboard.summary.comparison?.previousMonth?.balance
    ) {
      dashboard.summary.balance.changePercentage = this.calculatePercentageChange(
        dashboard.summary.balance.actual,
        dashboard.summary.comparison.previousMonth.balance
      );
    }

    return dashboard;
  }

  private enrichCategoriesWithPreviousData(dashboard: IDashboard): void {
    // Enriquecer categorias de renda
    if (dashboard.previousMonth?.categories?.income) {
      dashboard.categories.income.forEach(currentCategory => {
        const previousCategory = dashboard.previousMonth!.categories.income.find(
          pc => pc.id === currentCategory.id
        );
        if (previousCategory) {
          currentCategory.previousMonth = {
            actual: previousCategory.actual,
            percentage: previousCategory.percentage || 0,
            transactionCount: previousCategory.transactionCount,
          };
        }
      });
    }

    // Enriquecer categorias de despesa
    if (dashboard.previousMonth?.categories?.expense) {
      dashboard.categories.expense.forEach(currentCategory => {
        const previousCategory = dashboard.previousMonth!.categories.expense.find(
          pc => pc.id === currentCategory.id
        );
        if (previousCategory) {
          currentCategory.previousMonth = {
            actual: previousCategory.actual,
            percentage: previousCategory.percentage || 0,
            transactionCount: previousCategory.transactionCount,
          };
        }
      });
    }
  }

  calculateProgress(actual: number, estimated: number): number {
    if (!estimated || estimated === 0) {
      return actual > 0 ? 100 : 0;
    }

    const progress = (actual / estimated) * 100;
    return Math.round(progress * 100) / 100; // 2 casas decimais
  }

  calculatePercentageChange(current: number, previous: number): number {
    if (!previous || previous === 0) {
      return current > 0 ? 100 : 0;
    }

    const change = ((current - previous) / Math.abs(previous)) * 100;
    return Math.round(change * 100) / 100; // 2 casas decimais
  }

  private getEmptyDashboard(month?: number, year?: number): IDashboard {
    const currentDate = new Date();
    const targetMonth = month || getMonth(currentDate) + 1;
    const targetYear = year || getYear(currentDate);

    const emptyMetric: IFinancialMetric = {
      actual: 0,
      estimated: 0,
      previousMonth: 0,
      difference: 0,
      differenceFromPrevious: 0,
      progress: 0,
      changePercentage: 0,
    };

    return {
      period: this.formatPeriodDisplay(targetMonth, targetYear),
      summary: {
        income: { ...emptyMetric },
        expense: { ...emptyMetric },
        balance: { ...emptyMetric },
        debt: {
          totalDebt: 0,
          paidAmount: 0,
          remainingAmount: 0,
          totalInstallments: 0,
          overdueInstallments: 0,
          upcomingInstallments: [],
        },
        comparison: {
          previousMonth: {
            income: 0,
            expense: 0,
            balance: 0,
          },
          sameMonthLastYear: {
            income: 0,
            expense: 0,
            balance: 0,
          },
        },
      },
      categories: {
        income: [],
        expense: [],
      },
      recentTransactions: [],
      periodComparison: {
        previousMonth: {
          incomeChange: 0,
          expenseChange: 0,
          balanceChange: 0,
        },
        sameMonthLastYear: {
          incomeChange: 0,
          expenseChange: 0,
          balanceChange: 0,
        },
      },
      cashFlow: {
        dailyFlow: [],
        currentBalance: 0,
        projectedBalance: 0,
      },
    };
  }

  prepareComparisonChartData(
    currentDashboard: IDashboard,
    previousDashboard?: IDashboard
  ): IChartData {
    // Se não tiver dados do mês anterior, usa apenas o atual
    if (!previousDashboard) {
      return {
        labels: ['Renda', 'Despesas', 'Saldo'],
        datasets: [
          {
            label: 'Mês Atual',
            data: [
              currentDashboard.summary.income.actual,
              currentDashboard.summary.expense.actual,
              currentDashboard.summary.balance.actual,
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
            previousDashboard.summary.income.actual,
            previousDashboard.summary.expense.actual,
            previousDashboard.summary.balance.actual,
          ],
          backgroundColor: ['#ffae00'],
          borderColor: '#cc840a',
          borderWidth: 1,
        },
        {
          label: 'Mês Atual',
          data: [
            currentDashboard.summary.income.actual,
            currentDashboard.summary.expense.actual,
            currentDashboard.summary.balance.actual,
          ],
          backgroundColor: ['#B90504'],
          borderColor: '#970100',
          borderWidth: 1,
        },
      ],
    };
  }

  prepareFinancialSummaryCards(dashboard: IDashboard): IFinancialSummaryCard[] {
    return [
      {
        title: 'Renda Total',
        value: dashboard.summary.income.actual,
        icon: 'trending-up',
        iconColor: this.getIconColor(dashboard.summary.income.changePercentage),
        percentage: `${dashboard.summary.income.changePercentage > 0 ? '+' : ''}${dashboard.summary.income.changePercentage.toFixed(1)}%`,
        percentageColor: this.getPercentageColor(dashboard.summary.income.changePercentage),
      },
      {
        title: 'Despesas Totais',
        value: dashboard.summary.expense.actual,
        icon: 'trending-down',
        iconColor: this.getIconColor(dashboard.summary.expense.changePercentage, true),
        percentage: `${dashboard.summary.expense.changePercentage > 0 ? '+' : ''}${dashboard.summary.expense.changePercentage.toFixed(1)}%`,
        percentageColor: this.getPercentageColor(dashboard.summary.expense.changePercentage, true),
      },
      {
        title: 'Saldo',
        value: dashboard.summary.balance.actual,
        icon: 'dollar-sign',
        iconColor: this.getIconColor(dashboard.summary.balance.changePercentage),
        percentage: `${dashboard.summary.balance.changePercentage > 0 ? '+' : ''}${dashboard.summary.balance.changePercentage.toFixed(1)}%`,
        percentageColor: this.getPercentageColor(dashboard.summary.balance.changePercentage),
      },
    ];
  }

  /**
   * Determina a cor do ícone baseada na mudança percentual
   */
  private getIconColor(changePercentage: number, isExpense = false): 'danger' | 'success' | 'info' {
    if (isExpense) {
      // Para despesas: aumento é ruim (danger), redução é bom (success)
      return changePercentage > 0 ? 'danger' : changePercentage < 0 ? 'success' : 'info';
    } else {
      // Para renda/saldo: aumento é bom (success), redução é ruim (danger)
      return changePercentage > 0 ? 'success' : changePercentage < 0 ? 'danger' : 'info';
    }
  }

  private getPercentageColor(
    changePercentage: number,
    isExpense = false
  ): 'danger' | 'success' | 'info' {
    return this.getIconColor(changePercentage, isExpense);
  }

  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Método para navegar entre meses
   */
  navigateMonth(yearMonth: string, direction: 'prev' | 'next'): string {
    const { month, year } = this.parseYearMonth(yearMonth);
    const date = new Date(year, month - 1, 1);

    const newDate = direction === 'prev' ? subMonths(date, 1) : subMonths(date, -1);

    return this.formatYearMonth(getMonth(newDate) + 1, getYear(newDate));
  }

  /**
   * Verifica se um ano-mês é válido
   */
  isValidYearMonth(yearMonth: string): boolean {
    try {
      const { month, year } = this.parseYearMonth(yearMonth);
      return month >= 1 && month <= 12 && year > 0;
    } catch {
      return false;
    }
  }

  /**
   * Obtém a diferença em meses entre dois períodos AAAA-MM
   */
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

  /**
   * Obtém todos os meses entre dois períodos (inclusive)
   */
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
