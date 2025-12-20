import { EExpenseType } from '@shared/enums/expense-type.enum';
import { ICategory } from '@shared/interfaces/category.interface';
import { Debt } from '@shared/interfaces/debt.interface';
import { IFilter } from '@shared/interfaces/filter.interface';

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

export interface IExpenseOrderBy {
  id: string;
  category: string;
  type: number;
  disabled: boolean;
}

export interface IExpenseFilter extends IFilter<IExpenseOrderBy> {
  description?: string;
  categoryName?: string;
  type?: EExpenseType;
  hasDebt?: boolean;
  date?: Date;
  disabled?: boolean;
}
