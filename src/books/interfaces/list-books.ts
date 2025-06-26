import { Book } from '@prisma/client';

import { PaginatedResult } from '../../shared';

export type ListBooks = PaginatedResult<Book>;
