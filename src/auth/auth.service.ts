import { Injectable } from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(registerDto);

    return {
      user: {
        id: user.id,
      },
    };
  }
}
