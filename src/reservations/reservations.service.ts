import { ForbiddenException, Injectable } from '@nestjs/common';
import { Reservation } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListItemsDto, listPaginated } from '../shared';

import { CreateReservationDto, ListReservationsForUserDto } from './dto';
import { ListReservations, ReservationStatus } from './interfaces';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(reservation: CreateReservationDto): Promise<Reservation> {
    return this.prisma.reservation.create({ data: reservation });
  }

  async delete(id: number, userId: number): Promise<Reservation | null> {
    const reservation = await this.prisma.reservation.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!reservation) {
      return null;
    }

    return this.prisma.reservation.delete({
      where: {
        id,
        userId,
      },
    });
  }

  async findOne(id: number): Promise<Reservation | null> {
    return this.prisma.reservation.findUnique({
      where: {
        id,
      },
    });
  }

  async listAll(listReservationsDto: ListItemsDto): Promise<ListReservations> {
    return listPaginated<Reservation>(
      listReservationsDto,
      this.prisma.reservation,
    );
  }

  async listForUser(
    listReservationsForUserDto: ListReservationsForUserDto,
  ): Promise<ListReservations> {
    return listPaginated<Reservation>(
      listReservationsForUserDto,
      this.prisma.reservation,
      {
        where: { userId: listReservationsForUserDto.userId },
      },
    );
  }

  async updateStatus(
    id: number,
    userId: number,
    status: ReservationStatus,
  ): Promise<Reservation> {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!reservation || reservation.userId !== userId) {
      throw new ForbiddenException('You can update only your own reservations');
    }

    return this.prisma.reservation.update({
      where: { id },
      data: { status },
    });
  }
}
