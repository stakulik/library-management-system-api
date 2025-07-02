import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { Author } from '@prisma/client';

export const authorFactory = Factory.define<
  Omit<Author, 'id' | 'createdAt' | 'updatedAt'>
>(() => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
}));
