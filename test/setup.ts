import { PrismaService } from '../src/prisma';
import { cleanDatabase } from './helpers';

let prismaService: PrismaService;

beforeAll(async () => {
  prismaService = new PrismaService();

  await prismaService.$connect();
});

beforeEach(async () => {
  await cleanDatabase(prismaService);
});

afterAll(async () => {
  await cleanDatabase(prismaService);

  await prismaService.$disconnect();
});

export { prismaService };
