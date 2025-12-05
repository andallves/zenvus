export interface ICategory {
  id: string;
  name: string;
  color: string;
  disabled: boolean;
}

export interface ICategoryCreate {
  name: string;
  color: string;
}
