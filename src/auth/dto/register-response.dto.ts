import { RegisteredUserResponseDto } from './registered-user.dto';

export class RegisterResponseDto {
  readonly user: RegisteredUserResponseDto;

  readonly accessToken: string;

  readonly refreshToken: string;
}
