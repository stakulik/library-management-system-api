import { Injectable } from '@nestjs/common';
import { Author } from '@prisma/client';

import { PrismaService } from '../prisma';
import { defaultPageSize, maxPageSize } from '../shared';

import { CreateAuthorDto, ListAuthorsDto } from './dto';
import { ListAuthors, ListDirection, SortOrder } from './interfaces';

@Injectable()
export class AuthorsService {
  constructor(private prisma: PrismaService) {}

  async create(author: CreateAuthorDto): Promise<Author> {
    return this.prisma.author.create({ data: author });
  }

  async listAll(listAuthorsDto: ListAuthorsDto): Promise<ListAuthors> {
    const rawPageSize = listAuthorsDto.pageSize ?? defaultPageSize;
    const pageSize = Math.min(+rawPageSize, maxPageSize);

    const rawCursor = listAuthorsDto.cursor;
    let cursor;

    if (typeof rawCursor === 'string') {
      cursor = parseInt(rawCursor);
    }

    const direction = listAuthorsDto.direction ?? ListDirection.Forward;

    let authors: Author[];
    let hasNextPage = false;
    let hasPreviousPage = false;

    if (direction === ListDirection.Forward) {
      authors = await this.prisma.author.findMany({
        take: pageSize + 1,
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { id: SortOrder.Asc },
      });

      hasNextPage = authors.length > pageSize;

      if (hasNextPage) {
        authors.pop();
      }

      hasPreviousPage = !!cursor;
    } else {
      authors = await this.prisma.author.findMany({
        take: -(pageSize + 1),
        ...(cursor && {
          cursor: { id: cursor },
          skip: 1,
        }),
        orderBy: { id: SortOrder.Asc },
      });

      hasPreviousPage = authors.length > pageSize;

      if (hasPreviousPage) {
        authors.shift();
      }

      hasNextPage = !!cursor;
    }

    const nextCursor =
      hasNextPage && authors.length > 0 ? authors[authors.length - 1].id : null;

    const previousCursor =
      hasPreviousPage && authors.length > 0 ? authors[0].id : null;

    return {
      data: authors,
      pagination: {
        hasNextPage,
        hasPreviousPage,
        nextCursor,
        previousCursor,
      },
    };
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
