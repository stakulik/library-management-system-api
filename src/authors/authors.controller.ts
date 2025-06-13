import { Body, Controller, Get, Post } from '@nestjs/common';

import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto';
import { Author } from './interfaces';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  async create(
    @Body() createAuthorDto: CreateAuthorDto,
  ): Promise<Author | null> {
    return this.authorsService.create(createAuthorDto);
  }

  @Get()
  async findAll(): Promise<Author[]> {
    return this.authorsService.findAll();
  }
}
