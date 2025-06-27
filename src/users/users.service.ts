import { ConflictException, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '../prisma';
import { hashPassword, ListItemsDto, listPaginated } from '../shared';

import { ListUsers } from './interfaces';
import {
  CreateUserDto,
  UpdateRefreshTokenDto,
  ValidateRefreshTokenDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(user: CreateUserDto): Promise<User> {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: user.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await hashPassword(user.password);

    return this.prisma.user.create({
      data: {
        ...user,
        password: hashedPassword,
      },
    });
  }

  async delete(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOne(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: {
        id,
      },
    });
  }

  async listAll(listUsersDto: ListItemsDto): Promise<ListUsers> {
    return listPaginated<User>(listUsersDto, this.prisma.user);
  }

  async updateRefreshToken(
    updateRefreshTokenDto: UpdateRefreshTokenDto,
  ): Promise<void> {
    const hashedToken = updateRefreshTokenDto.refreshToken
      ? await hashPassword(updateRefreshTokenDto.refreshToken)
      : null;

    await this.prisma.user.update({
      where: { id: updateRefreshTokenDto.userId },
      data: { refreshToken: hashedToken },
    });
  }

  async validateRefreshToken(
    validateRefreshTokenDto: ValidateRefreshTokenDto,
  ): Promise<boolean> {
    const user = await this.findOne(validateRefreshTokenDto.userId);

    if (user?.refreshToken) {
      return bcrypt.compare(
        validateRefreshTokenDto.refreshToken,
        user.refreshToken,
      );
    }

    return false;
  }
}
