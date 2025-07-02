import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { Author, Book, ReservationStatus, User } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListDirection } from '../shared';
import {
  authorFactory,
  bookFactory,
  prismaService,
  userFactory,
} from '../../test';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto, ListReservationsForUserDto } from './dto';
import { ReservationStatus as ReservationStatusEnum } from './interfaces';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let user: User;
  let author: Author;
  let book: Book;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    service = module.get<ReservationsService>(ReservationsService);

    user = await prismaService.user.create({
      data: userFactory.build(),
    });

    author = await prismaService.author.create({
      data: authorFactory.build(),
    });

    book = await prismaService.book.create({
      data: bookFactory.build({ authorId: author.id }),
    });
  });

  describe('#create', () => {
    it('should create a reservation', async () => {
      const createReservationDto: CreateReservationDto = {
        dueDate: faker.date.recent(),
        bookId: book.id,
        userId: user.id,
      };

      const result = await service.create(createReservationDto);

      expect(result.id).toBeDefined();
      expect(result.bookId).toBe(book.id);
      expect(result.userId).toBe(user.id);
      expect(result.dueDate).toEqual(createReservationDto.dueDate);
      expect(result.status).toBe(ReservationStatus.PENDING);

      const reservationsAmount = await prismaService.reservation.count();
      expect(reservationsAmount).toBe(1);
    });

    describe('when wrong data supplied', () => {
      it('should throw an error', async () => {
        const createReservationDto: CreateReservationDto = {
          dueDate: faker.date.recent(),
          bookId: faker.number.int({ min: 1000, max: 9999 }),
          userId: user.id,
        };

        await expect(service.create(createReservationDto)).rejects.toThrow();
      });
    });
  });

  describe('#delete', () => {
    it('should delete a reservation', async () => {
      const reservation = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const result = await service.delete(reservation.id, user.id);

      expect(result?.id).toBe(reservation.id);

      const deletedReservation = await prismaService.reservation.findUnique({
        where: { id: reservation.id },
      });
      expect(deletedReservation).toBeNull();
    });

    describe('when reservation does not belong to user', () => {
      it('should delete nothing ', async () => {
        const otherUser = await prismaService.user.create({
          data: userFactory.build(),
        });

        const reservation = await prismaService.reservation.create({
          data: {
            dueDate: faker.date.recent(),
            bookId: book.id,
            userId: otherUser.id,
          },
        });

        const result = await service.delete(reservation.id, user.id);

        expect(result).toBeNull();

        const existingReservation = await prismaService.reservation.findUnique({
          where: { id: reservation.id },
        });
        expect(existingReservation).toBeDefined();
      });
    });
  });

  describe('#findOne', () => {
    it('should return reservation', async () => {
      const reservation = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const result = await service.findOne(reservation.id);

      expect(result?.id).toBe(reservation.id);
    });

    describe('when reservation does not exist', () => {
      it('should return null', async () => {
        const result = await service.findOne(faker.number.int(100));

        expect(result).toBeNull();
      });
    });
  });

  describe('#listAll', () => {
    it('should list all reservations with pagination', async () => {
      const reservation1 = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const reservation2 = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const listDto = {
        direction: ListDirection.Forward,
      };

      const result = await service.listAll(listDto);

      const resultIds = result.data.map((item) => item.id);
      expect(resultIds).toEqual([reservation1.id, reservation2.id]);
    });
  });

  describe('#listForUser', () => {
    it('should list reservations for a specific user', async () => {
      const userReservation1 = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: user.id,
        },
      });
      const userReservation2 = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const otherUser = await prismaService.user.create({
        data: userFactory.build(),
      });

      const otherUserReservation = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: otherUser.id,
        },
      });

      const listDto: ListReservationsForUserDto = {
        userId: user.id,
        direction: ListDirection.Forward,
      };

      const result = await service.listForUser(listDto);

      const resultIds = result.data.map((item) => item.id);
      expect(resultIds).toEqual([userReservation1.id, userReservation2.id]);
    });
  });

  describe('#updateStatus', () => {
    it('should update reservation status', async () => {
      const reservation = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.recent(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const result = await service.updateStatus(
        reservation.id,
        user.id,
        ReservationStatusEnum.Approved,
      );

      expect(result.id).toBe(reservation.id);
      expect(result.status).toBe(ReservationStatus.APPROVED);
    });

    describe('when wrong id supplied', () => {
      it('should throw ForbiddenException', async () => {
        await expect(
          service.updateStatus(
            faker.number.int(100),
            user.id,
            ReservationStatusEnum.Approved,
          ),
        ).rejects.toThrow(
          new ForbiddenException('You can update only your own reservations'),
        );
      });
    });

    describe('when reservation does not belong to user', () => {
      it('should throw ForbiddenException', async () => {
        const otherUser = await prismaService.user.create({
          data: userFactory.build(),
        });

        const reservation = await prismaService.reservation.create({
          data: {
            dueDate: faker.date.recent(),
            bookId: book.id,
            userId: otherUser.id,
          },
        });

        await expect(
          service.updateStatus(
            reservation.id,
            user.id,
            ReservationStatusEnum.Approved,
          ),
        ).rejects.toThrow(
          new ForbiddenException('You can update only your own reservations'),
        );

        const unchangedReservation = await prismaService.reservation.findUnique(
          {
            where: { id: reservation.id },
          },
        );
        expect(unchangedReservation?.status).toBe(ReservationStatus.PENDING);
      });
    });
  });
});
