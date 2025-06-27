import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users';

@Module({
  imports: [
    UsersModule,
  ],
  providers: [AuthService],
  controllers: [],
  exports: [AuthService],
})
export class AuthModule {}
