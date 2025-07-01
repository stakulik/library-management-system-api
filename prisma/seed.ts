import { PrismaClient, Role, ReservationStatus } from '@prisma/client';

import { getHash } from '../src/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('Start adding seeds');

  await prisma.reservation.deleteMany();
  await prisma.book.deleteMany();
  await prisma.author.deleteMany();
  await prisma.user.deleteMany();

  // Authors
  const author1 = await prisma.author.create({
    data: { firstName: 'J.K.', lastName: 'Rowling' },
  });

  const author2 = await prisma.author.create({
    data: { firstName: 'J.R.R.', lastName: 'Tolkien' },
  });

  // Books
  const book1 = await prisma.book.create({
    data: {
      title: "Harry Potter and the Philosopher's Stone",
      description: 'The first book about Harry Potter',
      authorId: author1.id,
    },
  });

  const _book2 = await prisma.book.create({
    data: {
      title: 'The Fellowship of the Ring',
      description: 'The first part of "The Lord of the Rings"',
      authorId: author2.id,
    },
  });

  // Users
  const user1 = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      firstName: 'Alice',
      lastName: 'Reader',
      password: await getHash('password123'),
      role: Role.USER,
    },
  });

  const _admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      firstName: 'Bob',
      lastName: 'Librarian',
      password: await getHash('admin123'),
      role: Role.ADMIN,
    },
  });

  // Reservations
  await prisma.reservation.create({
    data: {
      status: ReservationStatus.APPROVED,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      bookId: book1.id,
      userId: user1.id,
    },
  });

  console.log('Seeds added successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
