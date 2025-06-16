import { Author } from '@prisma/client';

export interface ListAuthors {
  data: Author[];
  pagination: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    nextCursor: number | null;
    previousCursor: number | null;
  };
}
