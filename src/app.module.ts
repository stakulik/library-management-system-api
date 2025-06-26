import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AuthorsModule } from './authors';
import { BooksModule } from './books';
import { UsersModule } from './users';

@Module({
  imports: [AuthorsModule, BooksModule, UsersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
