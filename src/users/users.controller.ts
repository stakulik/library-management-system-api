import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { ListItemsDto } from '../shared';

import { ListUsers } from './interfaces';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Get()
  async listAll(@Query() query: ListItemsDto): Promise<ListUsers> {
    return this.UsersService.listAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    const user = await this.UsersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  @Delete(':id')
  async delete(@Param('id', new ParseIntPipe()) id: number): Promise<User> {
    return this.UsersService.delete(id);
  }
}
