import { IsString, IsNotEmpty } from 'class-validator';

export class TokenPairDto {
  @IsString()
  @IsNotEmpty()
  readonly accessToken: string;

  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;
}
