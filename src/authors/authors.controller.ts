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
import { Author } from '@prisma/client';

import { ListItemsDto, Roles, UserRole } from '../shared';
import { RolesGuard } from '../common';

import { ListAuthors } from './interfaces';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  @Delete(':id')
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Author | null> {
    return this.authorsService.delete(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Author | null> {
    const author = await this.authorsService.findOne(id);

    if (!author) {
      throw new NotFoundException(`Author with id ${id} not found`);
    }

    return author;
  }

  @Get()
  async listAll(@Query() query: ListItemsDto): Promise<ListAuthors> {
    return this.authorsService.listAll(query);
  }
}
