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
import { Reservation } from '@prisma/client';

import { ListItemsDto } from '../shared';

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

  @Get()
  async listAll(@Query() query: ListItemsDto): Promise<ListReservations> {
    return this.reservationsService.listAll(query);
  }

  @Get(':id')
  async findOne(@Param('id', new ParseIntPipe()) id: number) {
    const reservation = await this.reservationsService.findOne(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation with id ${id} not found`);
    }

    return reservation;
  }

  @Delete(':id')
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
  ): Promise<Reservation> {
    return this.reservationsService.delete(id);
  }
}
