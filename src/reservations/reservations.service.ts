import { Injectable } from '@nestjs/common';
import { Reservation } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListItemsDto, listPaginated } from '../shared';

import { CreateReservationDto } from './dto';
import { ListReservations } from './interfaces';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(reservation: CreateReservationDto): Promise<Reservation> {
    return this.prisma.reservation.create({ data: reservation });
  }

  async listAll(listReservationsDto: ListItemsDto): Promise<ListReservations> {
    return listPaginated<Reservation>(
      listReservationsDto,
      this.prisma.reservation,
    );
  }

  async findOne(id: number) {
    return this.prisma.reservation.findUnique({
      where: {
        id,
      },
    });
  }

  async delete(id: number): Promise<Reservation> {
    return this.prisma.reservation.delete({
      where: {
        id,
      },
    });
  }
}
