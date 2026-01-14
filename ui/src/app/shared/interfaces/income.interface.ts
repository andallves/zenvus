import { IOptions } from '@shared/domain-types/options';
import { EExpenseType } from '@shared/enums/expense-type.enum';
import { EIncomeType } from '@shared/enums/income-type.enum';
import { IFilter } from '@shared/interfaces/filter.interface';

export interface IIncome {
  id: string;
  description: string;
  amount: number;
  categoryId: string;
  date: Date;
  type: EIncomeType;
  disabled: boolean;
}

export interface IIncomeOrderBy {
  id: string;
  category: string;
  type: number;
  disabled: boolean;
}

export interface IIncomeFilter extends IFilter<IIncomeOrderBy> {
  description?: string;
  categoryId?: string;
  month: number;
  year: number;
  type?: EIncomeType;
  disabled?: boolean;
}

export interface IIncomeRegister {
  description: string;
  typeId: EExpenseType;
  categoryId: string;
  amount: number;
  date: Date;
}

export interface IIncomeUpdate {
  id: string;
  description: string;
  typeId: EExpenseType;
  categoryId: string;
  amount: number;
  date: Date;
  disabled: boolean;
}

export interface IIncomeOptions {
  categoriesOptions: IOptions[];
  typesOptions: IOptions[];
}
