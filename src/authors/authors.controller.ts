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
import { Author } from '@prisma/client';

import { ListAuthors } from './interfaces';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto, ListAuthorsDto } from './dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  async listAll(@Query() query: ListAuthorsDto): Promise<ListAuthors> {
    return this.authorsService.listAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    const author = await this.authorsService.findOne(id);

    if (!author) {
      throw new NotFoundException(`Author with id ${id} not found`);
    }

    return author;
  }

  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe()) id: number): Promise<Author> {
    return this.authorsService.delete(id);
  }
}
