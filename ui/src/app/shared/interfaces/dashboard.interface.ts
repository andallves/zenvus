import { ECategoryType } from '@shared/enums/category-type.enum';
import { EPaymentStatus } from '@shared/enums/payment-status.enum';

export interface IExpenseCategory {
  id: string;
  name: string;
  actual: number;
  estimated: number;
  color: string;
  percentage: number;
  transactionCount: number;
  transactions: ITransaction[];
}

export interface IDashboardFilter {
  month: number | null;
  year: number | null;
}

export interface IFinancialMetric {
  actual: number;
  estimated: number;
  previousMonth: number;
  difference: number;
  differenceFromPrevious: number;
  progress: number;
  changePercentage: number;
}

export interface IInstallment {
  id: string;
  number: number;
  dueDate: string;
  amount: number;
  isOverdue: boolean;
  description: string;
}

export interface IDebtSummary {
  totalDebt: number;
  paidAmount: number;
  remainingAmount: number;
  totalInstallments: number;
  overdueInstallments: number;
  upcomingInstallments: IInstallment[];
}

export interface IFinancialSummary {
  income: IFinancialMetric;
  expense: IFinancialMetric;
  balance: IFinancialMetric;
  debt: IDebtSummary;
  comparison: {
    previousMonth: {
      income: number;
      expense: number;
      balance: number;
    };
    sameMonthLastYear: {
      income: number;
      expense: number;
      balance: number;
    };
  };
}

export interface ICategoryItem {
  id: string;
  name: string;
  color: string;
  actual: number;
  estimated: number;
  percentage: number;
  transactionCount: number;
  transactions: ITransaction[];
  previousMonth?: {
    actual: number;
    percentage: number;
    transactionCount: number;
  };
}

export interface ICategoriesByType {
  income: ICategoryItem[];
  expense: ICategoryItem[];
}

export interface ITransaction {
  id: string;
  description: string;
  amount: number;
  type: ECategoryType;
  category: string;
  categoryId: string;
  date: string;
  status: EPaymentStatus;
  hasDebt: boolean;
  isInstallment: boolean;
}

export interface IPeriodComparison {
  previousMonth: {
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  };
  sameMonthLastYear: {
    incomeChange: number;
    expenseChange: number;
    balanceChange: number;
  };
}

export interface IDailyCashFlow {
  date: string;
  income: number;
  expense: number;
  balance: number;
  accumulatedBalance: number;
}

export interface ICashFlowData {
  dailyFlow: IDailyCashFlow[];
  currentBalance: number;
  projectedBalance: number;
}

export interface IDashboard {
  period: string;
  summary: IFinancialSummary;
  categories: ICategoriesByType;
  recentTransactions: ITransaction[];
  periodComparison: IPeriodComparison;
  cashFlow: ICashFlowData;
  previousMonth?: {
    period: string;
    summary: {
      income: number;
      expense: number;
      balance: number;
    };
    categories: {
      income: {
        id: string;
        name: string;
        actual: number;
        percentage: number;
        transactionCount: number;
      }[];
      expense: {
        id: string;
        name: string;
        actual: number;
        percentage: number;
        transactionCount: number;
      }[];
    };
  };
}

export interface IFinancialSummaryCard {
  title: string;
  value: number;
  icon: string;
  iconColor: 'danger' | 'success' | 'info';
  percentage: string;
  percentageColor: 'danger' | 'success' | 'info';
}

export interface IChartData {
  labels: string[];
  datasets: IDataset[];
}

export interface IDataset {
  label?: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  borderWidth?: number | number[];
  borderDash?: number | number[];
}
