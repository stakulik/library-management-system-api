import { reservationFactory } from '../../reservation.factory';

export const overdueReservationTrait = reservationFactory.params({
  dueDate: new Date('2023-12-01T10:00:00Z'),
});
