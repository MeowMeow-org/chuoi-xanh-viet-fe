//----------------Pagination----------------

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  previousPage: number | null;
  nextPage: number | null;
}
