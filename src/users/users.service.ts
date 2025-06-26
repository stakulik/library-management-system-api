import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListItemsDto, listPaginated } from '../shared';

import { ListUsers } from './interfaces';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async listAll(listUsersDto: ListItemsDto): Promise<ListUsers> {
    return listPaginated<User>(listUsersDto, this.prisma.user);
  }

  async findOne(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id,
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
}
