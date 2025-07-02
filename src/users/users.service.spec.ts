import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { faker } from '@faker-js/faker';

import { PrismaService } from '../prisma';
import { ListDirection } from '../shared';
import { userFactory, prismaService } from '../../test';

import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateRefreshTokenDto,
  ValidateRefreshTokenDto,
} from './dto';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('#create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
      };

      const result = await prismaService.$transaction(async (tx) => {
        return service.create(createUserDto, tx);
      });

      expect(result.id).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.firstName).toBe(createUserDto.firstName);
      expect(result.lastName).toBe(createUserDto.lastName);
      expect(result.password).not.toBe(createUserDto.password);

      const usersAmount = await prismaService.user.count();
      expect(usersAmount).toBe(1);
    });

    describe('when user with email already exists', () => {
      it('should throw an error', async () => {
        const existingUser = await prismaService.user.create({
          data: userFactory.build(),
        });

        const createUserDto: CreateUserDto = {
          email: existingUser.email,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          password: faker.internet.password(),
        };

        await expect(
          prismaService.$transaction(async (tx) => {
            return service.create(createUserDto, tx);
          }),
        ).rejects.toThrow(
          new ConflictException('User with this email already exists'),
        );
      });
    });
  });

  describe('#delete', () => {
    it('should delete a user', async () => {
      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      const result = await service.delete(user.id);

      expect(result?.id).toBe(user.id);

      const deletedUser = await prismaService.user.findUnique({
        where: { id: user.id },
      });
      expect(deletedUser).toBeNull();
    });

    describe('when user does not exist', () => {
      it('should return null', async () => {
        const result = await service.delete(faker.number.int(100));

        expect(result).toBeNull();
      });
    });
  });

  describe('#findByEmail', () => {
    it('should return user by email', async () => {
      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      const result = await service.findByEmail(user.email);

      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    describe('when user does not exist', () => {
      it('should return null', async () => {
        const result = await service.findByEmail(faker.internet.email());

        expect(result).toBeNull();
      });
    });
  });

  describe('#findOne', () => {
    it('should return user by id', async () => {
      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      const result = await service.findOne(user.id);

      expect(result?.id).toBe(user.id);
      expect(result?.email).toBe(user.email);
    });

    describe('when user does not exist', () => {
      it('should return null', async () => {
        const result = await service.findOne(faker.number.int(100));

        expect(result).toBeNull();
      });
    });
  });

  describe('#listAll', () => {
    it('should list all users with pagination', async () => {
      const user1 = await prismaService.user.create({
        data: userFactory.build(),
      });

      const user2 = await prismaService.user.create({
        data: userFactory.build(),
      });

      const listDto = {
        direction: ListDirection.Forward,
      };

      const result = await service.listAll(listDto);

      const resultIds = result.data.map((item) => item.id);
      expect(resultIds).toEqual([user1.id, user2.id]);
    });
  });

  describe('#updateRefreshToken', () => {
    it('should update refresh token', async () => {
      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      const updateDto: UpdateRefreshTokenDto = {
        userId: user.id,
        refreshToken: faker.string.alphanumeric(64),
      };

      await service.updateRefreshToken(updateDto);

      const updatedUser = await prismaService.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.refreshToken).toBeDefined();
      expect(updatedUser?.refreshToken).not.toBe(updateDto.refreshToken);
    });

    describe('when refreshToken is null', () => {
      it('should set refreshToken to null', async () => {
        const user = await prismaService.user.create({
          data: userFactory.build({ refreshToken: 'some-token' }),
        });

        const updateDto: UpdateRefreshTokenDto = {
          userId: user.id,
          refreshToken: null,
        };

        await service.updateRefreshToken(updateDto);

        const updatedUser = await prismaService.user.findUnique({
          where: { id: user.id },
        });

        expect(updatedUser?.refreshToken).toBeNull();
      });
    });
  });

  describe('#validateRefreshToken', () => {
    it('should return true for valid refresh token', async () => {
      const refreshToken = faker.string.alphanumeric(64);

      const user = await prismaService.user.create({
        data: userFactory.build(),
      });

      await service.updateRefreshToken({
        userId: user.id,
        refreshToken,
      });

      const validateDto: ValidateRefreshTokenDto = {
        userId: user.id,
        refreshToken,
      };

      const result = await prismaService.$transaction(async (tx) => {
        return service.validateRefreshToken(validateDto, tx);
      });

      expect(result).toBe(true);
    });

    describe('when refresh token is invalid', () => {
      it('should return false', async () => {
        const user = await prismaService.user.create({
          data: userFactory.build(),
        });

        await service.updateRefreshToken({
          userId: user.id,
          refreshToken: 'valid-token',
        });

        const validateDto: ValidateRefreshTokenDto = {
          userId: user.id,
          refreshToken: 'invalid-token',
        };

        const result = await prismaService.$transaction(async (tx) => {
          return service.validateRefreshToken(validateDto, tx);
        });

        expect(result).toBe(false);
      });
    });

    describe('when user has no refresh token', () => {
      it('should return false', async () => {
        const user = await prismaService.user.create({
          data: userFactory.build({ refreshToken: null }),
        });

        const validateDto: ValidateRefreshTokenDto = {
          userId: user.id,
          refreshToken: 'any-token',
        };

        const result = await prismaService.$transaction(async (tx) => {
          return service.validateRefreshToken(validateDto, tx);
        });

        expect(result).toBe(false);
      });
    });
  });
});
