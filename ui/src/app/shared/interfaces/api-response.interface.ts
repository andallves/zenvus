export interface ApiResponse<T> {
  currentPage: number;
  hasMorePage: boolean;
  hasPage: boolean;
  isFirstPage: boolean;
  isLastPage: boolean;
  lastPage: number;
  pageSize: number;
  result: T[];
  totalPages: number;
  totalResults: number;
}
