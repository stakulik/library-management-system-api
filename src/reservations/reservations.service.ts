import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reservation } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListItemsDto, listPaginated } from '../shared';

import { CreateReservationDto, ListReservationsForUserDto } from './dto';
import { ListReservations, ReservationStatus } from './interfaces';

@Injectable()
export class ReservationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    reservation: CreateReservationDto,
    userId: number,
  ): Promise<Reservation> {
    const existingReservation = await this.prisma.reservation.findFirst({
      where: {
        bookId: reservation.bookId,
        userId: userId,
        status: {
          in: [ReservationStatus.Pending, ReservationStatus.Approved],
        },
      },
    });

    if (existingReservation) {
      throw new ConflictException(
        'You already have an active reservation for this book',
      );
    }

    return this.prisma.reservation.create({ data: { ...reservation, userId } });
  }

  async delete(id: number, userId: number): Promise<Reservation | null> {
    const reservation = await this.prisma.reservation.findFirst({
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
