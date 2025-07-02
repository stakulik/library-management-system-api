import { PrismaService } from '../../src/prisma';

export class DatabaseCleanup {
  constructor(private prisma: PrismaService) {}

  async cleanAll(): Promise<void> {
    await this.prisma.reservation.deleteMany();
    await this.prisma.book.deleteMany();
    await this.prisma.author.deleteMany();
    await this.prisma.user.deleteMany();

    await this.prisma.$executeRaw`SELECT setval('users_id_seq', 1, false)`;
    await this.prisma.$executeRaw`SELECT setval('authors_id_seq', 1, false)`;
    await this.prisma.$executeRaw`SELECT setval('books_id_seq', 1, false)`;
    await this.prisma
      .$executeRaw`SELECT setval('reservations_id_seq', 1, false)`;
  }

  async cleanReservations(): Promise<void> {
    await this.prisma.reservation.deleteMany();
  }

  async cleanBooks(): Promise<void> {
    await this.prisma.reservation.deleteMany();
    await this.prisma.book.deleteMany();
  }

  async cleanAuthors(): Promise<void> {
    await this.prisma.reservation.deleteMany();
    await this.prisma.book.deleteMany();
    await this.prisma.author.deleteMany();
  }

  async cleanUsers(): Promise<void> {
    await this.prisma.reservation.deleteMany();
    await this.prisma.book.deleteMany();
    await this.prisma.author.deleteMany();
    await this.prisma.user.deleteMany();
  }
}

export const cleanDatabase = (prisma: PrismaService) => {
  return new DatabaseCleanup(prisma).cleanAll();
};
