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
  transactions: IDashboardTransaction[];
}

export interface IDashboardFilter {
  month: number | null;
  year: number | null;
}

export interface IDashboardCategory {
  id: string;
  name: string;
  color: string;
  actual: number;
  estimated: number;
  percentage: number;
  transactionCount: number;
  transactions: IDashboardTransaction[];
}

export interface IDashboardTransaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: EPaymentStatus;
  type: ECategoryType;
  hasDebt: boolean;
  isInstallment: boolean;
  installmentNumber: string;
}

export interface IDashboard {
  period: string;
  totals: IDashboardTotals;
  categories: ICategoriesSummary;
  debt: IDebtSummary;
}

export interface IMetric {
  actual: number;
  estimated: number;
  previous: number;
  difference: number;
  differenceFromPrevious: number;
  progress: number;
  changePercentage: number;
}

export interface IDashboardTotals {
  income: IMetric;
  expense: IMetric;
  balance: IMetric;
}

export interface IDebtSummary {
  totalDebt: number;
  paidAmount: number;
  remainingAmount: number;
  totalInstallments: number;
  paidInstallments: number;
  overdueInstallments: number;
  upcomingInstallments: IUpcomingInstallment[];
}

export interface IUpcomingInstallment {
  id: string;
  number: number;
  dueDate: Date;
  amount: number;
  isOverdue: boolean;
  description: string;
}

export interface ICategoriesSummary {
  income: IDashboardCategory[];
  expense: IDashboardCategory[];
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
