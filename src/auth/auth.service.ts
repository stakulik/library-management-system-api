import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from '../users';
import { PrismaService } from '../prisma';
import {
  accessTokenExpiration,
  compareHashes,
  refreshTokenExpiration,
} from '../shared';

import {
  GetProfileResponseDto,
  LoginResponseDto,
  LoginDto,
  RegisterDto,
  RefreshTokensDto,
  RefreshTokensResponseDto,
  RegisterResponseDto,
  TokenPairDto,
} from './dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await this.usersService.create(registerDto, tx);

        const tokens = await this.generateTokens(user.id, user.email);

        await this.usersService.updateRefreshToken(
          { userId: user.id, refreshToken: tokens.refreshToken },
          tx,
        );

        return {
          user,
          tokens,
        };
      });

      return {
        user: {
          id: result.user.id,
        },
        ...result.tokens,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await compareHashes(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    await this.usersService.updateRefreshToken({
      userId: user.id,
      refreshToken: tokens.refreshToken,
    });

    return {
      user: {
        id: user.id,
      },
      ...tokens,
    };
  }

  async refreshTokens(
    refreshTokensDto: RefreshTokensDto,
  ): Promise<RefreshTokensResponseDto> {
    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const user = await this.usersService.findOne(
          refreshTokensDto.userId,
          tx,
        );

        if (!user) {
          throw new UnauthorizedException('Access denied');
        }

        const isRefreshTokenValid =
          await this.usersService.validateRefreshToken(refreshTokensDto, tx);

        if (!isRefreshTokenValid) {
          throw new UnauthorizedException('Access denied');
        }

        const tokens = await this.generateTokens(user.id, user.email);
        await this.usersService.updateRefreshToken(
          { userId: user.id, refreshToken: tokens.refreshToken },
          tx,
        );

        return tokens;
      });

      return result;
    } catch (error) {
      throw new InternalServerErrorException();
    }
  }

  async getProfile(userId: number): Promise<GetProfileResponseDto> {
    const user = await this.usersService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
    };
  }

  async logout(userId: number): Promise<void> {
    await this.usersService.updateRefreshToken({ userId, refreshToken: null });
  }

  private async generateTokens(
    userId: number,
    email: string,
  ): Promise<TokenPairDto> {
    const payload = { sub: userId, email };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: accessTokenExpiration,
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: refreshTokenExpiration,
      }),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
