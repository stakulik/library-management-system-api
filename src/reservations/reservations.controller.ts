import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Reservation } from '@prisma/client';

import { ListItemsDto, Roles, UserRole } from '../shared';
import { RolesGuard } from '../common';

import { ListReservations } from './interfaces';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationStatusDto } from './dto';

@Controller('reservations')
export class ReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Post()
  async create(
    @Body() createReservationDto: CreateReservationDto,
    @Req() req,
  ): Promise<Reservation> {
    const userId = req.user.userId;

    return this.reservationsService.create(createReservationDto, userId);
  }

  @Delete(':id')
  async delete(
    @Param('id', new ParseIntPipe()) id: number,
    @Req() req,
  ): Promise<Reservation | null> {
    const userId = req.user.userId;

    return this.reservationsService.delete(id, userId);
  }

  @Get()
  @Roles(UserRole.Admin)
  @UseGuards(RolesGuard)
  async listAll(@Query() query: ListItemsDto): Promise<ListReservations> {
    return this.reservationsService.listAll(query);
  }

  @Get('my')
  async listForUser(
    @Req() req,
    @Query() query: ListItemsDto,
  ): Promise<ListReservations> {
    const userId = req.user.userId;

    return this.reservationsService.listForUser({ ...query, userId });
  }

  @Put(':id/status')
  async updateStatus(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() updateStatusDto: UpdateReservationStatusDto,
    @Req() req,
  ): Promise<Reservation> {
    const userId = req.user.userId;

    return this.reservationsService.updateStatus(
      id,
      userId,
      updateStatusDto.status,
    );
  }
}
