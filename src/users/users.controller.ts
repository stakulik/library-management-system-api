import {
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { ListItemsDto, Roles, UserRole } from '../shared';
import { RolesGuard } from '../common';

import { ListUsers } from './interfaces';
import { UsersService } from './users.service';

@Controller('users')
@Roles(UserRole.Admin)
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly UsersService: UsersService) {}

  @Delete(':id')
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<User | null> {
    return this.UsersService.delete(id);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    const user = await this.UsersService.findOne(id);

    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    return user;
  }

  @Get()
  async listAll(@Query() query: ListItemsDto): Promise<ListUsers> {
    return this.UsersService.listAll(query);
  }
}
