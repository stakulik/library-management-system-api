import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { Reservation, ReservationStatus } from '@prisma/client';

export const reservationFactory = Factory.define<
  Omit<Reservation, 'id' | 'createdAt' | 'updatedAt'>
>(() => ({
  status: ReservationStatus.PENDING,
  reservedAt: faker.date.recent(),
  dueDate: faker.date.recent(),
  returnedAt: null,
  bookId: faker.number.int({ min: 1, max: 1000 }),
  userId: faker.number.int({ min: 1, max: 1000 }),
}));
