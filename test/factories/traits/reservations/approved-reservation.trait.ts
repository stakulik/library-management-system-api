import { ReservationStatus } from '@prisma/client';

import { reservationFactory } from '../../reservation.factory';

export const approvedReservationTrait = reservationFactory.params({
  status: ReservationStatus.APPROVED,
});
