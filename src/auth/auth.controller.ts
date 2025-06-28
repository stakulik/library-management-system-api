import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';

import { AuthService } from './auth.service';
import {
  GetProfileResponseDto,
  LoginResponseDto,
  LoginDto,
  LogoutResponseDto,
  RegisterDto,
  RegisterResponseDto,
  RefreshTokensResponseDto,
} from './dto';
import { JwtAuthGuard, JwtRefreshGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<LoginResponseDto> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refreshTokens(@Req() req): Promise<RefreshTokensResponseDto> {
    return this.authService.refreshTokens({
      userId: req.user.userId,
      refreshToken: req.user.refreshToken,
    });
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Req() req): Promise<GetProfileResponseDto> {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req): Promise<LogoutResponseDto> {
    await this.authService.logout(req.user.userId);

    return { message: 'Logged out successfully' };
  }
}
