export interface PaginatedResult<M> {
  data: M[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: number | null;
    previousCursor: number | null;
  };
}
