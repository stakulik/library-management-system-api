import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { Book } from '@prisma/client';

export const bookFactory = Factory.define<
  Omit<Book, 'id' | 'createdAt' | 'updatedAt'>
>(() => ({
  title: faker.lorem.words(),
  description: faker.lorem.words(),
  authorId: faker.number.int({ min: 1, max: 1000 }),
}));
