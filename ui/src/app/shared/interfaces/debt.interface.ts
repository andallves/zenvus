import { EPaymentStatus } from '@shared/enums/payment-status.enum';

export interface Debt {
  id: string;
  isInstallment: boolean;
  totalInstallments: number;
  firstDueDate: Date;
  installments: DebtInstallment[];
}

export interface DebtCreate {
  isInstallment: boolean;
  totalInstallments: number;
  firstDueDate: Date;
}

export interface DebtInstallment {
  id: string;
  number: number;
  amount: number;
  status: EPaymentStatus;
  paymentDate: Date;
}
