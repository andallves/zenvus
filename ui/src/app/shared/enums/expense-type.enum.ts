export enum EExpenseType {
  Fixed = 1,
  Variable = 2,
  Subscription = 3,
  Loan = 4,
  Other = 5,
}

export const ExpenseTypeLabel: Record<number, string> = {
  [EExpenseType.Fixed]: 'Fixo',
  [EExpenseType.Variable]: 'Variável',
  [EExpenseType.Subscription]: 'Assinatura',
  [EExpenseType.Loan]: 'Empréstimo',
  [EExpenseType.Other]: 'Outro',
};

export const ExpenseIsInstallmentLabel: Record<number, string> = {};
