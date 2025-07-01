import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Book } from '@prisma/client';

import { ListItemsDto, Roles, UserRole } from '../shared';
import { RolesGuard } from '../common';

import { ListBooks } from './interfaces';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Book | null> {
    return this.booksService.delete(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Book | null> {
    const book = await this.booksService.findOne(id);

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  @Get()
  async listAll(@Query() query: ListItemsDto): Promise<ListBooks> {
    return this.booksService.listAll(query);
  }
}
