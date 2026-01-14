export enum EIncomeType {
  Salary = 1,
  Bonus = 2,
  Gift = 3,
  Other = 4,
}

export const IncomeTypeLabel: Record<number, string> = {
  [EIncomeType.Salary]: 'Salário',
  [EIncomeType.Bonus]: 'Bônus',
  [EIncomeType.Gift]: 'Presente',
  [EIncomeType.Other]: 'Outro',
};
