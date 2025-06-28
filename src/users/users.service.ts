import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';

import { PrismaService } from '../prisma';
import { compareHashes, getHash, ListItemsDto, listPaginated } from '../shared';

import { ListUsers } from './interfaces';
import {
  CreateUserDto,
  UpdateRefreshTokenDto,
  ValidateRefreshTokenDto,
} from './dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(
    user: CreateUserDto,
    tx: Prisma.TransactionClient,
  ): Promise<User> {
    const existingUser = await this.findByEmail(user.email, tx);

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await getHash(user.password);

    return tx.user.create({
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

  async findByEmail(
    email: string,
    tx?: Prisma.TransactionClient,
  ): Promise<User | null> {
    return (tx ?? this.prisma).user.findUnique({ where: { email } });
  }

  async findOne(
    id: number,
    tx?: Prisma.TransactionClient,
  ): Promise<User | null> {
    return (tx ?? this.prisma).user.findUnique({ where: { id } });
  }

  async listAll(listUsersDto: ListItemsDto): Promise<ListUsers> {
    return listPaginated<User>(listUsersDto, this.prisma.user);
  }

  async updateRefreshToken(
    updateRefreshTokenDto: UpdateRefreshTokenDto,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const hashedToken = updateRefreshTokenDto.refreshToken
      ? await getHash(updateRefreshTokenDto.refreshToken)
      : null;

    await (tx ?? this.prisma).user.update({
      where: { id: updateRefreshTokenDto.userId },
      data: { refreshToken: hashedToken },
    });
  }

  async validateRefreshToken(
    validateRefreshTokenDto: ValidateRefreshTokenDto,
    tx: Prisma.TransactionClient,
  ): Promise<boolean> {
    const user = await this.findOne(validateRefreshTokenDto.userId, tx);

    if (user?.refreshToken) {
      return compareHashes(
        validateRefreshTokenDto.refreshToken!,
        user.refreshToken,
      );
    }

    return false;
  }
}
