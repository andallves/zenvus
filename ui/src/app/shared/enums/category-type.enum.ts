export enum ECategoryType {
  Income = 1,
  Expense = 2,
}

export const CategoryTypeLabel: Record<number, string> = {
  [ECategoryType.Income]: 'Entrada',
  [ECategoryType.Expense]: 'Saída',
};
