import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class UpdateRefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;

  @IsInt()
  @IsNotEmpty()
  readonly userId: number;
}
