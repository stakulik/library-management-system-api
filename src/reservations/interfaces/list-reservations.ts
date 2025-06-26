import { Reservation } from '@prisma/client';

import { PaginatedResult } from '../../shared';

export type ListReservations = PaginatedResult<Reservation>;
