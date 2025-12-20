export interface IFilter<T> {
  orderBy: T;
  itemsPerPage: number;
  page: number;
  orderAsc: boolean;
}
