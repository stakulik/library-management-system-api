import { User } from '@prisma/client';

import { PaginatedResult } from '../../shared';

export type ListUsers = PaginatedResult<User>;
