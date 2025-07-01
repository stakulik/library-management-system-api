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

  async delete(id: number): Promise<Author | null> {
    const author = await this.findOne(id);

    if (!author) {
      return null;
    }

    return this.prisma.author.delete({ where: { id } });
  }

  async findOne(id: number): Promise<Author | null> {
    return this.prisma.author.findUnique({
      where: {
        id,
      },
    });
  }

  async listAll(listAuthorsDto: ListItemsDto): Promise<ListAuthors> {
    return listPaginated<Author>(listAuthorsDto, this.prisma.author);
  }
}
