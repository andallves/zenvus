import { IOptions } from '@shared/domain-types/options';
import { EExpenseType } from '@shared/enums/expense-type.enum';
import { ICategory } from '@shared/interfaces/category.interface';
import { IDebt, IDebtCreate } from '@shared/interfaces/debt.interface';
import { IFilter } from '@shared/interfaces/filter.interface';

export interface IExpense {
  id: string;
  description: string;
  type: EExpenseType;
  categoryId: string;
  categoryName: string;
  category: ICategory;
  color: string;
  amount: number;
  date: Date | string;
  hasDebt: boolean;
  debt?: IDebt;
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
  debt: IDebtCreate | null;
}

export interface IExpenseUpdate {
  id: string;
  description: string;
  type: EExpenseType;
  categoryId: string;
  amount: number;
  date: Date | string;
  debt?: IDebt | IDebtCreate | null;
  disabled: boolean;
}

export interface IExpenseOptions {
  categoriesOptions: IOptions[];
  typesOptions: IOptions[];
  isInstallmentsOptions: IOptions[];
}
