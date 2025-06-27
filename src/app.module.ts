import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthModule } from './auth';
import { AuthorsModule } from './authors';
import { BooksModule } from './books';
import { ReservationsModule } from './reservations';
import { UsersModule } from './users';

@Module({
  imports: [
    AuthModule,
    AuthorsModule,
    BooksModule,
    ReservationsModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
