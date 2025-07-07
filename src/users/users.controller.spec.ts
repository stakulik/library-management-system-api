import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { PrismaService } from '../prisma';
import { ListDirection } from '../shared';
import { userFactory, prismaService } from '../../test';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('#delete', () => {
    it('should delete a user', async () => {
      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      const result = await controller.delete(user.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(user.id);

      const deletedUser = await prismaService.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    it('should call UsersService.delete with correct parameters', async () => {
      const deleteSpy = jest.spyOn(usersService, 'delete');
      const userId = faker.number.int({ min: 1, max: 1000 });

      try {
        await controller.delete(userId);
      } catch {
        // Expected to return null since user doesn't exist
      }

      expect(deleteSpy).toHaveBeenCalledWith(userId);
    });

    describe('when user does not exist', () => {
      it('should return null', async () => {
        const result = await controller.delete(
          faker.number.int({ min: 100, max: 1000 }),
        );

        expect(result).toBeNull();
      });
    });
  });

  describe('#findOne', () => {
    it('should return a user by id', async () => {
      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      const result = await controller.findOne(user.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.firstName).toBe(user.firstName);
      expect(result.lastName).toBe(user.lastName);
    });

    it('should call UsersService.findOne with correct parameters', async () => {
      const findOneSpy = jest.spyOn(usersService, 'findOne');
      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      await controller.findOne(user.id);

      expect(findOneSpy).toHaveBeenCalledWith(user.id);
    });

    describe('when user does not exist', () => {
      it('should throw NotFoundException', async () => {
        const nonExistentId = faker.number.int({ min: 100, max: 1000 });

        await expect(controller.findOne(nonExistentId)).rejects.toThrow(
          new NotFoundException(`User with id ${nonExistentId} not found`),
        );
      });
    });
  });

  describe('#listAll', () => {
    it('should return paginated list of users', async () => {
      const user1 = await prismaService.user.create({
        data: userFactory.build(),
      });

      const user2 = await prismaService.user.create({
        data: userFactory.build(),
      });

      const queryDto = {
        direction: ListDirection.Forward,
      };

      const result = await controller.listAll(queryDto);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(2);
      expect(result.pagination).toBeDefined();

      const resultIds = result.data.map((user) => user.id);
      expect(resultIds).toContain(user1.id);
      expect(resultIds).toContain(user2.id);
    });

    it('should call UsersService.listAll with correct parameters', async () => {
      const listAllSpy = jest.spyOn(usersService, 'listAll');
      const queryDto = {
        direction: ListDirection.Forward,
        pageSize: '5',
        cursor: '1',
      };

      await controller.listAll(queryDto);

      expect(listAllSpy).toHaveBeenCalledWith(queryDto);
    });

    it('should handle pagination parameters', async () => {
      await Promise.all(
        Array.from({ length: 5 }, () =>
          prismaService.user.create({
            data: userFactory.build(),
          }),
        ),
      );

      const queryDto = {
        direction: ListDirection.Forward,
        pageSize: '3',
      };

      const result = await controller.listAll(queryDto);

      expect(result.data).toHaveLength(3);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(false);
    });

    describe('when no users exist', () => {
      it('should return empty list', async () => {
        await prismaService.user.deleteMany();

        const queryDto = {
          direction: ListDirection.Forward,
        };

        const result = await controller.listAll(queryDto);

        expect(result.data).toHaveLength(0);
        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPreviousPage).toBe(false);
      });
    });

    describe('with cursor pagination', () => {
      it('should return next page with cursor', async () => {
        const users = await Promise.all(
          Array.from({ length: 5 }, () =>
            prismaService.user.create({
              data: userFactory.build(),
            }),
          ),
        );

        users.sort((a, b) => a.id - b.id);

        const queryDto = {
          direction: ListDirection.Forward,
          pageSize: '2',
          cursor: users[1].id.toString(),
        };

        const result = await controller.listAll(queryDto);

        expect(result.data).toHaveLength(2);
        expect(result.data[0].id).toBe(users[2].id);
        expect(result.data[1].id).toBe(users[3].id);
        expect(result.pagination.hasNextPage).toBe(true);
        expect(result.pagination.hasPreviousPage).toBe(true);
      });
    });
  });
});
