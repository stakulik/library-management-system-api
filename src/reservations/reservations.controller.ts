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
import { Reservation } from '@prisma/client';

import { ListItemsDto, Roles, UserRole } from '../shared';
import { RolesGuard } from '../common';

import { ListReservations } from './interfaces';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
  ): Promise<Reservation> {
    return this.reservationsService.create(createReservationDto);
  }

  @Delete(':id')
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Reservation> {
    return this.reservationsService.delete(id);
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Reservation | null> {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }

    return reservation;
  }

  @Get()
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async listAll(@Query() query: ListItemsDto): Promise<ListReservations> {
    return this.reservationsService.listAll(query);
  }
}
