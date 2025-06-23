import { Module } from '@nestjs/common';

import { PrismaModule } from '../prisma/prisma.module';

import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  controllers: [AuthorsController],
  imports: [PrismaModule],
  providers: [AuthorsService],
})
export class AuthorsModule {}
