import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';

import { userFactory, prismaService } from '../../test';

import { listPaginated } from './list-paginated';
import { ListDirection } from './interfaces';
import { defaultPageSize, maxPageSize } from './constants';

describe('listPaginated', () => {
  let users: User[];

  beforeEach(async () => {
    const userData = Array.from({ length: 15 }, () => userFactory.build());

    users = await Promise.all(
      userData.map((data) => prismaService.user.create({ data })),
    );

    users.sort((a, b) => a.id - b.id);
  });

  describe('forward pagination', () => {
    it('should return first page with default page size', async () => {
      const listDto = {
        direction: ListDirection.Forward,
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(defaultPageSize);
      expect(result.data[0].id).toBe(users[0].id);
      expect(result.data[defaultPageSize - 1].id).toBe(
        users[defaultPageSize - 1].id,
      );
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
      expect(result.pagination.nextCursor).toBe(users[defaultPageSize - 1].id);
      expect(result.pagination.previousCursor).toBeNull();
    });

    it('should return specific page size', async () => {
      const pageSize = 5;
      const listDto = {
        direction: ListDirection.Forward,
        pageSize: pageSize.toString(),
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(pageSize);
      expect(result.data[0].id).toBe(users[0].id);
      expect(result.data[pageSize - 1].id).toBe(users[pageSize - 1].id);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should return second page with cursor', async () => {
      const pageSize = 5;
      const cursor = users[4].id;

      const listDto = {
        direction: ListDirection.Forward,
        pageSize: pageSize.toString(),
        cursor: cursor.toString(),
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(pageSize);
      expect(result.data[0].id).toBe(users[5].id);
      expect(result.data[pageSize - 1].id).toBe(users[9].id);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
      expect(result.pagination.nextCursor).toBe(users[9].id);
      expect(result.pagination.previousCursor).toBe(users[5].id);
    });

    it('should return last page without next page', async () => {
      const pageSize = 10;
      const cursor = users[4].id;

      const listDto = {
        direction: ListDirection.Forward,
        pageSize: pageSize.toString(),
        cursor: cursor.toString(),
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(pageSize);
      expect(result.data[0].id).toBe(users[5].id);
      expect(result.data[pageSize - 1].id).toBe(users[14].id);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
      expect(result.pagination.nextCursor).toBeNull();
      expect(result.pagination.previousCursor).toBe(users[5].id);
    });
  });

  describe('backward pagination', () => {
    it('should return page before cursor', async () => {
      const pageSize = 5;
      const cursor = users[9].id;

      const listDto = {
        direction: ListDirection.Backward,
        pageSize: pageSize.toString(),
        cursor: cursor.toString(),
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(pageSize);
      expect(result.data[0].id).toBe(users[4].id);
      expect(result.data[pageSize - 1].id).toBe(users[8].id);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
      expect(result.pagination.nextCursor).toBe(users[8].id);
      expect(result.pagination.previousCursor).toBe(users[4].id);
    });

    describe('when going backward from beginning', () => {
      it('should return first page ', async () => {
        const pageSize = 5;
        const cursor = users[2].id;

        const listDto = {
          direction: ListDirection.Backward,
          pageSize: pageSize.toString(),
          cursor: cursor.toString(),
        };

        const result = await listPaginated(listDto, prismaService.user);

        expect(result.data).toHaveLength(2);
        expect(result.data[0].id).toBe(users[0].id);
        expect(result.data[1].id).toBe(users[1].id);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPreviousPage).toBe(false);
        expect(result.pagination.nextCursor).toBe(users[1].id);
        expect(result.pagination.previousCursor).toBeNull();
      });
    });
  });

  describe('page size limits', () => {
    it('should enforce maximum page size', async () => {
      const listDto = {
        direction: ListDirection.Forward,
        pageSize: (maxPageSize + 50).toString(),
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data.length).toBeLessThanOrEqual(maxPageSize);
    });

    it('should use default page size when not specified', async () => {
      const listDto = {
        direction: ListDirection.Forward,
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(defaultPageSize);
    });

    it('should handle string page size conversion', async () => {
      const pageSize = 3;
      const listDto = {
        direction: ListDirection.Forward,
        pageSize: pageSize.toString(),
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(pageSize);
    });
  });

  describe('edge cases', () => {
    it('should handle empty result set', async () => {
      await prismaService.user.deleteMany();

      const listDto = {
        direction: ListDirection.Forward,
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(false);
      expect(result.pagination.nextCursor).toBeNull();
      expect(result.pagination.previousCursor).toBeNull();
    });

    it('should handle invalid cursor', async () => {
      const listDto = {
        direction: ListDirection.Forward,
        cursor: faker.number.int(10000).toString(),
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(0);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(true);
      expect(result.pagination.nextCursor).toBeNull();
      expect(result.pagination.previousCursor).toBeNull();
    });

    it('should handle non-numeric cursor string', async () => {
      const listDto = {
        direction: ListDirection.Forward,
        cursor: 'invalid-cursor',
      };

      const result = await listPaginated(listDto, prismaService.user);

      expect(result.data).toHaveLength(defaultPageSize);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });
  });

  describe('with options', () => {
    it('should apply where clause from options', async () => {
      const specialUser = await prismaService.user.create({
        data: userFactory.build({ email: 'special@example.com' }),
      });

      const listDto = {
        direction: ListDirection.Forward,
      };

      const options = {
        where: {
          email: { contains: 'special' },
        },
      };

      const result = await listPaginated(listDto, prismaService.user, options);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(specialUser.id);
      expect(result.pagination.hasNextPage).toBe(false);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    it('should combine cursor with where clause', async () => {
      const specialUsers = await Promise.all([
        prismaService.user.create({
          data: userFactory.build({ email: 'test1@special.com' }),
        }),
        prismaService.user.create({
          data: userFactory.build({ email: 'test2@special.com' }),
        }),
        prismaService.user.create({
          data: userFactory.build({ email: 'test3@special.com' }),
        }),
      ]);

      specialUsers.sort((a, b) => a.id - b.id);

      const listDto = {
        direction: ListDirection.Forward,
        pageSize: '1',
        cursor: specialUsers[0].id.toString(),
      };

      const options = {
        where: {
          email: { endsWith: 'special.com' },
        },
      };

      const result = await listPaginated(listDto, prismaService.user, options);

      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(specialUsers[1].id);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });
  });
});
