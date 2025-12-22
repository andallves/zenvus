import { IOptions } from '@shared/domain-types/options';
import { EExpenseType } from '@shared/enums/expense-type.enum';
import { ICategory } from '@shared/interfaces/category.interface';
import { Debt, DebtCreate } from '@shared/interfaces/debt.interface';
import { IFilter } from '@shared/interfaces/filter.interface';

export interface IExpense {
  id: string;
  description: string;
  type: EExpenseType;
  categoryName: string;
  category: ICategory;
  color: string;
  amount: number;
  date: Date | string;
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

export interface IExpenseCreate {
  description: string;
  type: EExpenseType;
  categoryId: string;
  amount: number;
  date: Date;
  debt: DebtCreate | null;
  disabled: boolean;
}

export type IExpenseUpdate = Omit<IExpense, 'disabled' | 'categoryColor'>;

export interface IExpenseOptions {
  categoriesOptions: IOptions[];
  typesOptions: IOptions[];
  isInstallmentsOptions: IOptions[];
}
