import { ECategoryType } from '@shared/enums/category-type.enum';
import { IFilter } from '@shared/interfaces/filter.interface';

export interface ICategory {
  id: string;
  name: string;
  color: string;
  type: ECategoryType;
  disabled: boolean;
}

export interface ICategoryCreate {
  name: string;
  color: string;
  type: ECategoryType;
}

export type ICategoryEdit = Omit<ICategory, 'type' | 'disabled'> & {
  type: number;
};

export interface ICategoryFilter extends IFilter<ICategoryOrderBy> {
  name?: string;
  color?: string;
  type?: ECategoryType;
}

export interface ICategoryOrderBy {
  id: string;
  name: string;
  color: string;
  type: string;
  disabled: boolean;
}
