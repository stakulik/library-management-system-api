import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { PrismaModule } from '../prisma';
import { UsersModule } from '../users';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtRefreshStrategy, JwtStrategy } from './strategies';

@Module({
  imports: [PrismaModule, UsersModule, PassportModule, JwtModule.register({})],
  providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
