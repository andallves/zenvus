import { ECategoryType } from '@shared/enums/category-type.enum';

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
  type: string;
};

export interface IFilterCategory {
  name: string;
  color: string;
  type: ECategoryType;
}
