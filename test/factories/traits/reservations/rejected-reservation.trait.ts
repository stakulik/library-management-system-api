import { ReservationStatus } from '@prisma/client';

import { reservationFactory } from '../../reservation.factory';

export const rejectedReservationTrait = reservationFactory.params({
  status: ReservationStatus.REJECTED,
});
