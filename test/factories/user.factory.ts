import { faker } from '@faker-js/faker';
import { Factory } from 'fishery';
import { User, Role } from '@prisma/client';

export const userFactory = Factory.define<
  Omit<User, 'id' | 'createdAt' | 'updatedAt'>
>(() => ({
  email: faker.internet.email(),
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  password: faker.lorem.word(),
  refreshToken: null,
  role: Role.USER,
}));
