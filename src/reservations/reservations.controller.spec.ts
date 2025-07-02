import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { ReservationStatus, User, Author, Book } from '@prisma/client';

import { PrismaService } from '../prisma';
import { ListDirection } from '../shared';
import {
  userFactory,
  authorFactory,
  bookFactory,
  prismaService,
} from '../../test';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto, UpdateReservationStatusDto } from './dto';
import { ReservationStatus as ReservationStatusEnum } from './interfaces';

describe('ReservationsController', () => {
  let controller: ReservationsController;
  let reservationsService: ReservationsService;
  let user: User;
  let author: Author;
  let book: Book;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReservationsController],
      providers: [
        ReservationsService,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    controller = module.get<ReservationsController>(ReservationsController);
    reservationsService = module.get<ReservationsService>(ReservationsService);

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
        dueDate: faker.date.future(),
        bookId: book.id,
        userId: user.id,
      };

      const result = await controller.create(createReservationDto);

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(result.bookId).toBe(book.id);
      expect(result.userId).toBe(user.id);
      expect(result.status).toBe(ReservationStatus.PENDING);

      const reservationsAmount = await prismaService.reservation.count();
      expect(reservationsAmount).toBe(1);
    });

    it('should call ReservationsService.create with correct parameters', async () => {
      const createSpy = jest.spyOn(reservationsService, 'create');
      const createReservationDto: CreateReservationDto = {
        dueDate: faker.date.future(),
        bookId: book.id,
        userId: user.id,
      };

      await controller.create(createReservationDto);

      expect(createSpy).toHaveBeenCalledWith(createReservationDto);
    });

    describe('when wrong data supplied', () => {
      it('should throw an error', async () => {
        const createReservationDto: CreateReservationDto = {
          dueDate: faker.date.future(),
          bookId: faker.number.int({ min: 1000, max: 9999 }),
          userId: user.id,
        };

        await expect(controller.create(createReservationDto)).rejects.toThrow();
      });
    });
  });

  describe('#delete', () => {
    it('should delete a reservation', async () => {
      const reservation = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.future(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const mockRequest = {
        user: { id: user.id },
      };

      const result = await controller.delete(reservation.id, mockRequest);

      expect(result).toBeDefined();
      expect(result?.id).toBe(reservation.id);

      const deletedReservation = await prismaService.reservation.findUnique({
        where: { id: reservation.id },
      });
      expect(deletedReservation).toBeNull();
    });

    it('should call ReservationsService.delete with correct parameters', async () => {
      const deleteSpy = jest.spyOn(reservationsService, 'delete');
      const reservationId = faker.number.int({ min: 1, max: 1000 });
      const mockRequest = {
        user: { id: user.id },
      };

      await controller.delete(reservationId, mockRequest);

      expect(deleteSpy).toHaveBeenCalledWith(reservationId, user.id);
    });

    describe('when reservation does not belong to user', () => {
      it('should return null', async () => {
        const otherUser = await prismaService.user.create({
          data: userFactory.build(),
        });

        const reservation = await prismaService.reservation.create({
          data: {
            dueDate: faker.date.future(),
            bookId: book.id,
            userId: otherUser.id,
          },
        });

        const mockRequest = {
          user: { id: user.id },
        };

        const result = await controller.delete(reservation.id, mockRequest);

        expect(result).toBeNull();

        const existingReservation = await prismaService.reservation.findUnique({
          where: { id: reservation.id },
        });
        expect(existingReservation).toBeDefined();
      });
    });
  });

  describe('#listAll', () => {
    it('should return paginated list of all reservations', async () => {
      const reservation1 = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.future(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const reservation2 = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.future(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const queryDto = {
        direction: ListDirection.Forward,
      };

      const result = await controller.listAll(queryDto);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(2);

      const resultIds = result.data.map((item) => item.id);
      expect(resultIds).toContain(reservation1.id);
      expect(resultIds).toContain(reservation2.id);
    });

    it('should call ReservationsService.listAll with correct parameters', async () => {
      const listAllSpy = jest.spyOn(reservationsService, 'listAll');
      const queryDto = {
        direction: ListDirection.Forward,
        pageSize: '5',
        cursor: '1',
      };

      await controller.listAll(queryDto);

      expect(listAllSpy).toHaveBeenCalledWith(queryDto);
    });

    describe('when no reservations exist', () => {
      it('should return empty list', async () => {
        await prismaService.reservation.deleteMany();

        const queryDto = {
          direction: ListDirection.Forward,
        };

        const result = await controller.listAll(queryDto);

        expect(result.data).toHaveLength(0);
        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPreviousPage).toBe(false);
      });
    });
  });

  describe('#listForUser', () => {
    it('should return reservations for the authenticated user', async () => {
      const otherUser = await prismaService.user.create({
        data: userFactory.build(),
      });

      const userReservation = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.future(),
          bookId: book.id,
          userId: user.id,
        },
      });

      await prismaService.reservation.create({
        data: {
          dueDate: faker.date.future(),
          bookId: book.id,
          userId: otherUser.id,
        },
      });

      const mockRequest = {
        user: { id: user.id },
      };

      const queryDto = {
        direction: ListDirection.Forward,
      };

      const result = await controller.listForUser(mockRequest, queryDto);

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe(userReservation.id);
      expect(result.data[0].userId).toBe(user.id);
    });

    it('should call ReservationsService.listForUser with correct parameters', async () => {
      const listForUserSpy = jest.spyOn(reservationsService, 'listForUser');
      const mockRequest = {
        user: { id: user.id },
      };

      const queryDto = {
        direction: ListDirection.Forward,
        pageSize: '5',
      };

      await controller.listForUser(mockRequest, queryDto);

      expect(listForUserSpy).toHaveBeenCalledWith({
        ...queryDto,
        userId: user.id,
      });
    });

    describe('when user has no reservations', () => {
      it('should return empty list', async () => {
        const mockRequest = {
          user: { id: user.id },
        };

        const queryDto = {
          direction: ListDirection.Forward,
        };

        const result = await controller.listForUser(mockRequest, queryDto);

        expect(result.data).toHaveLength(0);
        expect(result.pagination.hasNextPage).toBe(false);
        expect(result.pagination.hasPreviousPage).toBe(false);
      });
    });
  });

  describe('#updateStatus', () => {
    it('should update reservation status when it belongs to user', async () => {
      const reservation = await prismaService.reservation.create({
        data: {
          dueDate: faker.date.future(),
          bookId: book.id,
          userId: user.id,
        },
      });

      const updateStatusDto: UpdateReservationStatusDto = {
        status: ReservationStatusEnum.Approved,
      };

      const mockRequest = {
        user: { id: user.id },
      };

      const result = await controller.updateStatus(
        reservation.id,
        updateStatusDto,
        mockRequest,
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(reservation.id);
      expect(result.status).toBe(ReservationStatus.APPROVED);
    });

    it('should call ReservationsService.updateStatus with correct parameters', async () => {
      const updateStatusSpy = jest.spyOn(reservationsService, 'updateStatus');
      const reservationId = faker.number.int({ min: 1, max: 1000 });
      const updateStatusDto: UpdateReservationStatusDto = {
        status: ReservationStatusEnum.Rejected,
      };
      const mockRequest = {
        user: { id: user.id },
      };

      try {
        await controller.updateStatus(
          reservationId,
          updateStatusDto,
          mockRequest,
        );
      } catch {
        // Expected to fail since reservation doesn't exist
      }

      expect(updateStatusSpy).toHaveBeenCalledWith(
        reservationId,
        user.id,
        ReservationStatusEnum.Rejected,
      );
    });

    describe('when reservation does not belong to user', () => {
      it('should throw ForbiddenException', async () => {
        const otherUser = await prismaService.user.create({
          data: userFactory.build(),
        });

        const reservation = await prismaService.reservation.create({
          data: {
            dueDate: faker.date.future(),
            bookId: book.id,
            userId: otherUser.id,
          },
        });

        const updateStatusDto: UpdateReservationStatusDto = {
          status: ReservationStatusEnum.Approved,
        };

        const mockRequest = {
          user: { id: user.id },
        };

        await expect(
          controller.updateStatus(reservation.id, updateStatusDto, mockRequest),
        ).rejects.toThrow(
          new ForbiddenException('You can update only your own reservations'),
        );
      });
    });

    describe('when reservation does not exist', () => {
      it('should throw ForbiddenException', async () => {
        const updateStatusDto: UpdateReservationStatusDto = {
          status: ReservationStatusEnum.Approved,
        };

        const mockRequest = {
          user: { id: user.id },
        };

        await expect(
          controller.updateStatus(
            faker.number.int({ min: 1, max: 1000 }),
            updateStatusDto,
            mockRequest,
          ),
        ).rejects.toThrow(
          new ForbiddenException('You can update only your own reservations'),
        );
      });
    });
  });
});
