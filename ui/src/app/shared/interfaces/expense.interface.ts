import { EExpenseType } from '@shared/enums/expense-type.enum';
import { ICategory } from '@shared/interfaces/category.interface';
import { Debt } from '@shared/interfaces/debt.interface';

export interface IExpense {
  id: string;
  type: EExpenseType;
  categoryName: string;
  category: ICategory;
  amount: number;
  date: Date | string;
  description: string;
  hasDebt: boolean;
  debt: Debt;
  disabled: boolean;
}
