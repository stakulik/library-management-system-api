import { Injectable } from '@nestjs/common';
import { Book } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListItemsDto, listPaginated } from '../shared';

import { CreateBookDto } from './dto';
import { ListBooks } from './interfaces';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async create(book: CreateBookDto): Promise<Book> {
    return this.prisma.book.create({ data: book });
  }

  async listAll(listBooksDto: ListItemsDto): Promise<ListBooks> {
    return listPaginated<Book>(listBooksDto, this.prisma.book);
  }

  async findOne(id: number) {
    return this.prisma.book.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: number): Promise<Book> {
    return this.prisma.book.delete({
      where: {
        id,
      },
    });
  }
}
