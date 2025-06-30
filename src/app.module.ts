import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';

import { AuthModule, JwtAuthGuard } from './auth';
import { AuthorsModule } from './authors';
import { BooksModule } from './books';
import { PrismaModule } from './prisma';
import { ReservationsModule } from './reservations';
import { UsersModule } from './users';
import { RolesGuard } from './common';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    AuthorsModule,
    BooksModule,
    PrismaModule,
    ReservationsModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
