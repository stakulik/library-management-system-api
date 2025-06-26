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
} from '@nestjs/common';
import { Book } from '@prisma/client';

import { ListItemsDto } from '../shared';
import { RolesGuard } from '../common';

import { ListBooks } from './interfaces';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createBookDto: CreateBookDto): Promise<Book> {
    return this.booksService.create(createBookDto);
  }

  @Get()
  async listAll(@Query() query: ListItemsDto): Promise<ListBooks> {
    return this.booksService.listAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    const book = await this.booksService.findOne(id);

    if (!book) {
      throw new NotFoundException(`Book with id ${id} not found`);
    }

    return book;
  }

  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe()) id: number): Promise<Book> {
    return this.booksService.delete(id);
  }
}
