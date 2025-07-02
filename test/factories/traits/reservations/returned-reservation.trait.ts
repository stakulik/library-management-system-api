import { ReservationStatus } from '@prisma/client';

import { reservationFactory } from '../../reservation.factory';

export const returnedReservationTrait = reservationFactory.params({
  status: ReservationStatus.RETURNED,
  returnedAt: new Date('2024-01-10T10:00:00Z'),
});
