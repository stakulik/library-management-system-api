import { Author } from '@prisma/client';

import { PaginatedResult } from '../../shared';

export type ListAuthors = PaginatedResult<Author>;
