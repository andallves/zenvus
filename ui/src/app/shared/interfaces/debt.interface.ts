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
  debtId: string;
  number: number;
  amount: number;
  amountPaid: number;
  status: EPaymentStatus;
  dueDate: Date;
  paymentDate: Date;
}

export interface IDebtInstallmentUpdate {
  debtId: string;
  installmentId: string;
  dueDate: Date;
  paymentDate: Date;
}

export interface IDebtInstallmentPay {
  debtId: string;
  installmentId: string;
  paymentDate: Date;
  paidAmount: number;
}

export interface IDebtInstallmentRefund {
  debtId: string;
  installmentId: string;
  paymentDate: Date;
  amountPaid: number;
}
