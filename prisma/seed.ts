import { PrismaClient, Role, ReservationStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start adding seeds');

  await prisma.$transaction([
    prisma.reservation.deleteMany(),
    prisma.book.deleteMany(),
    prisma.author.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Authors
  const [rowling, tolkien] = await prisma.$transaction([
    prisma.author.create({
      data: { firstName: 'J.K.', lastName: 'Rowling' },
    }),
    prisma.author.create({
      data: { firstName: 'J.R.R.', lastName: 'Tolkien' },
    }),
  ]);

  // Books
  const [hp1, _lotr1] = await prisma.$transaction([
    prisma.book.create({
      data: {
        title: "Harry Potter and the Philosopher's Stone",
        description: 'The first book about Harry Potter',
        authorId: rowling.id,
      },
    }),
    prisma.book.create({
      data: {
        title: 'The Fellowship of the Ring',
        description: 'The first part of "The Lord of the Rings"',
        authorId: tolkien.id,
      },
    }),
  ]);

  // Users
  const [alice, _admin] = await prisma.$transaction([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        firstName: 'Alice',
        lastName: 'Reader',
        password: await bcrypt.hash('password123', 10),
        role: Role.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'admin@example.com',
        firstName: 'Bob',
        lastName: 'Librarian',
        password: await bcrypt.hash('admin123', 10),
        role: Role.ADMIN,
      },
    }),
  ]);

  // Reservations
  await prisma.reservation.create({
    data: {
      status: ReservationStatus.APPROVED,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      bookId: hp1.id,
      userId: alice.id,
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
