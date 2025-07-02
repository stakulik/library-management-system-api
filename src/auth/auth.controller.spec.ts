import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { faker } from '@faker-js/faker';

import { PrismaService } from '../prisma';
import { UsersService } from '../users';
import { userFactory, prismaService } from '../../test';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto';

const createUser = async (data) =>
  prismaService.$transaction(async (tx) => {
    const usersService = new UsersService(prismaService);

    return usersService.create(data, tx);
  });

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
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

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  describe('#register', () => {
    it('should register a new user', async () => {
      const registerDto: RegisterDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
      };

      const result = await controller.register(registerDto);

      expect(result).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();

      const usersAmount = await prismaService.user.count();
      expect(usersAmount).toBe(1);
    });

    it('should call AuthService.register with correct parameters', async () => {
      const registerSpy = jest.spyOn(authService, 'register');
      const registerDto: RegisterDto = {
        email: faker.internet.email(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        password: faker.internet.password(),
      };

      await controller.register(registerDto);

      expect(registerSpy).toHaveBeenCalledWith(registerDto);
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

        await expect(controller.register(registerDto)).rejects.toThrow(
          ConflictException,
        );
      });
    });
  });

  describe('#login', () => {
    it('should login with valid credentials', async () => {
      const password = faker.internet.password();
      const userData = userFactory.build({ password });
      const user = await createUser(userData);

      const loginDto: LoginDto = {
        email: user.email,
        password,
      };

      const result = await controller.login(loginDto);

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

        await expect(controller.login(loginDto)).rejects.toThrow(
          new UnauthorizedException('Invalid credentials'),
        );
      });

      it('should call AuthService.login with correct parameters', async () => {
        const loginSpy = jest.spyOn(authService, 'login');
        const loginDto: LoginDto = {
          email: faker.internet.email(),
          password: faker.internet.password(),
        };

        try {
          await controller.login(loginDto);
        } catch {
          // Expected to fail since user doesn't exist
        }

        expect(loginSpy).toHaveBeenCalledWith(loginDto);
      });
    });

    describe('when password is invalid', () => {
      it('should throw an error', async () => {
        const userData = userFactory.build();
        const user = await createUser(userData);

        const loginDto: LoginDto = {
          email: user.email,
          password: 'wrong-password',
        };

        await expect(controller.login(loginDto)).rejects.toThrow(
          new UnauthorizedException('Invalid credentials'),
        );
      });
    });
  });

  describe('#refreshTokens', () => {
    it('should refresh tokens with valid refresh token', async () => {
      const refreshToken = faker.string.alphanumeric(64);
      const userData = userFactory.build();
      const user = await createUser(userData);

      const usersService = new UsersService(prismaService);
      await usersService.updateRefreshToken({
        userId: user.id,
        refreshToken,
      });

      const mockRequest = {
        user: {
          userId: user.id,
          refreshToken,
        },
      };

      const result = await controller.refreshTokens(mockRequest);

      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    describe('when user does not exist', () => {
      it('should throw an error', async () => {
        const mockRequest = {
          user: {
            userId: faker.number.int(100),
            refreshToken: faker.string.alphanumeric(64),
          },
        };

        await expect(controller.refreshTokens(mockRequest)).rejects.toThrow();
      });

      it('should call AuthService.refreshTokens with correct parameters', async () => {
        const refreshTokensSpy = jest.spyOn(authService, 'refreshTokens');
        const mockRequest = {
          user: {
            userId: faker.number.int(),
            refreshToken: faker.string.alphanumeric(64),
          },
        };

        try {
          await controller.refreshTokens(mockRequest);
        } catch {
          // Expected to fail since user doesn't exist
        }

        expect(refreshTokensSpy).toHaveBeenCalledWith({
          userId: mockRequest.user.userId,
          refreshToken: mockRequest.user.refreshToken,
        });
      });
    });

    describe('when refresh token is invalid', () => {
      it('should throw an error', async () => {
        const userData = userFactory.build();
        const user = await createUser(userData);

        const usersService = new UsersService(prismaService);
        await usersService.updateRefreshToken({
          userId: user.id,
          refreshToken: 'valid-token',
        });

        const mockRequest = {
          user: {
            userId: user.id,
            refreshToken: 'invalid-token',
          },
        };

        await expect(controller.refreshTokens(mockRequest)).rejects.toThrow();
      });
    });
  });

  describe('#getProfile', () => {
    it('should return user profile', async () => {
      const userData = userFactory.build();
      const user = await createUser(userData);

      const mockRequest = {
        user: {
          userId: user.id,
        },
      };

      const result = await controller.getProfile(mockRequest);

      expect(result).toBeDefined();
      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
      expect(result.firstName).toBe(user.firstName);
      expect(result.lastName).toBe(user.lastName);
    });

    describe('when user does not exist', () => {
      it('should throw an error', async () => {
        const mockRequest = {
          user: {
            userId: faker.number.int(100),
          },
        };

        await expect(controller.getProfile(mockRequest)).rejects.toThrow(
          new UnauthorizedException('User not found'),
        );
      });
    });
  });

  describe('#logout', () => {
    it('should logout user successfully', async () => {
      const refreshToken = faker.string.alphanumeric(64);
      const userData = userFactory.build();
      const user = await createUser(userData);

      const usersService = new UsersService(prismaService);
      await usersService.updateRefreshToken({
        userId: user.id,
        refreshToken,
      });

      const mockRequest = {
        user: {
          userId: user.id,
        },
      };

      const result = await controller.logout(mockRequest);

      expect(result).toBeDefined();
      expect(result.message).toBe('Logged out successfully');

      const updatedUser = await prismaService.user.findUnique({
        where: { id: user.id },
      });

      expect(updatedUser?.refreshToken).toBeNull();
    });

    it('should call AuthService.logout with correct parameters', async () => {
      const logoutSpy = jest.spyOn(authService, 'logout');
      const userData = userFactory.build();
      const user = await createUser(userData);

      const mockRequest = {
        user: {
          userId: user.id,
        },
      };

      await controller.logout(mockRequest);

      expect(logoutSpy).toHaveBeenCalledWith(user.id);
    });
  });
});
