import { Injectable } from '@nestjs/common';
import { Author } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListItemsDto, listPaginated } from '../shared';

import { CreateAuthorDto } from './dto';
import { ListAuthors } from './interfaces';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async create(author: CreateAuthorDto): Promise<Author> {
    return this.prisma.author.create({ data: author });
  }

  async listAll(listAuthorsDto: ListItemsDto): Promise<ListAuthors> {
    return listPaginated<Author>(listAuthorsDto, this.prisma.author);
  }

  async findOne(id: number) {
    return this.prisma.author.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: number): Promise<Author> {
    return this.prisma.author.delete({
      where: {
        id,
      },
    });
  }
}
