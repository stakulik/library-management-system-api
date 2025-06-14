import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';

import { RolesGuard } from '../common';

import { BooksService } from './books.service';
import { CreateBookDto } from './dto';
import { Book } from './interfaces';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createBookDto: CreateBookDto): Promise<Book | null> {
    return this.booksService.create(createBookDto);
  }

  @Get()
  async findAll(): Promise<Book[]> {
    return this.booksService.findAll();
  }
}
