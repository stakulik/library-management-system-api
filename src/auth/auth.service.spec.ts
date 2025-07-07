import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';

import { PrismaService } from '../prisma';
import { UsersService } from '../users';
import { userFactory, prismaService } from '../../test';

import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, RefreshTokensDto } from './dto';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockImplementation((payload) => {
              return Promise.resolve(`token-${payload.sub}-${payload.email}`);
            }),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('#register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
      };

      const result = await service.register(registerDto);

      expect(result).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      const usersAmount = await prismaService.user.count();
      expect(usersAmount).toBe(1);
    });

    describe('when user with email already exists', () => {
      it('should throw an error', async () => {
        const existingUser = await prismaService.user.create({
          data: userFactory.build(),
        });

        const registerDto: RegisterDto = {
          email: existingUser.email,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          password: faker.internet.password(),
        };

        await expect(service.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
      });
    });
  });

  describe('#login', () => {
    it('should login with valid credentials', async () => {
      const password = faker.internet.password();
      const userData = userFactory.build({ password });

      const user = await prismaService.$transaction(async (tx) => {
        return usersService.create(userData, tx);
      });

      const loginDto: LoginDto = {
        email: user.email,
        password,
      };

      const result = await service.login(loginDto);

      expect(result).toBeDefined();
      expect(result.user.id).toBe(user.id);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    describe('when user does not exist', () => {
      it('should throw an error', async () => {
        const loginDto: LoginDto = {
          email: faker.internet.email(),
          password: faker.internet.password(),
        };

        await expect(service.login(loginDto)).rejects.toThrow(
          new UnauthorizedException('Invalid credentials'),
        );
      });
    });

    describe('when password is invalid', () => {
      it('should throw an error', async () => {
        const userData = userFactory.build();

        const user = await prismaService.$transaction(async (tx) => {
          return usersService.create(userData, tx);
        });

        const loginDto: LoginDto = {
          email: user.email,
          password: 'wrong-password',
        };

        await expect(service.login(loginDto)).rejects.toThrow(
          new UnauthorizedException('Invalid credentials'),
        );
      });
    });
  });

  describe('#refreshTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const refreshToken = faker.string.alphanumeric(64);
      const userData = userFactory.build();

      const user = await prismaService.$transaction(async (tx) => {
        return usersService.create(userData, tx);
      });

      await usersService.updateRefreshToken({
        userId: user.id,
        refreshToken,
      });

      const refreshTokensDto: RefreshTokensDto = {
        userId: user.id,
        refreshToken,
      };

      const result = await service.refreshTokens(refreshTokensDto);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    describe('when user does not exist', () => {
      it('should throw an error', async () => {
        const refreshTokensDto: RefreshTokensDto = {
          userId: faker.number.int(100),
          refreshToken: faker.string.alphanumeric(64),
        };

        await expect(service.refreshTokens(refreshTokensDto)).rejects.toThrow(
          new UnauthorizedException('Access denied'),
        );
      });
    });

    describe('when refresh token is invalid', () => {
      it('should throw an error', async () => {
        const userData = userFactory.build();

        const user = await prismaService.$transaction(async (tx) => {
          return usersService.create(userData, tx);
        });

        await usersService.updateRefreshToken({
          userId: user.id,
          refreshToken: 'valid-token',
        });

        const refreshTokensDto: RefreshTokensDto = {
          userId: user.id,
          refreshToken: 'invalid-token',
        };

        await expect(service.refreshTokens(refreshTokensDto)).rejects.toThrow(
          new UnauthorizedException('Access denied'),
        );
      });
    });
  });

  describe('#getProfile', () => {
    it('should return user profile', async () => {
      const userData = userFactory.build();

      const user = await prismaService.$transaction(async (tx) => {
        return usersService.create(userData, tx);
      });

      const result = await service.getProfile(user.id);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.firstName).toBe(user.firstName);
      expect(result.lastName).toBe(user.lastName);
    });

    describe('when user does not exist', () => {
      it('should throw an error', async () => {
        await expect(service.getProfile(faker.number.int(100))).rejects.toThrow(
          new UnauthorizedException('User not found'),
        );
      });
    });
  });

  describe('#logout', () => {
    it('should clear refresh token', async () => {
      const refreshToken = faker.string.alphanumeric(64);
      const userData = userFactory.build();

      const user = await prismaService.$transaction(async (tx) => {
        return usersService.create(userData, tx);
      });

      await usersService.updateRefreshToken({
        userId: user.id,
        refreshToken,
      });

      await service.logout(user.id);

      const updatedUser = await prismaService.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.refreshToken).toBeNull();
    });
  });
});
