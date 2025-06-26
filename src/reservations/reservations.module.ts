import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { ReservationsController } from './reservations.controller';
import { ReservationsService } from './reservations.service';

@Module({
  controllers: [ReservationsController],
  imports: [PrismaModule],
  providers: [ReservationsService],
})
export class ReservationsModule {}
