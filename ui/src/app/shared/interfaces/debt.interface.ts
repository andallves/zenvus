import { EPaymentStatus } from '@shared/enums/payment-status.enum';

export interface IDebt {
  id: string;
  isInstallment: boolean;
  totalInstallments: number;
  firstDueDate: Date;
  installments: IDebtInstallment[];
}

export interface IDebtCreate {
  isInstallment: boolean;
  totalInstallments: number;
  firstDueDate: Date;
}

export interface IDebtInstallment {
  id: string;
  number: number;
  amount: number;
  status: EPaymentStatus;
  dueDate: Date;
  paymentDate: Date;
}
