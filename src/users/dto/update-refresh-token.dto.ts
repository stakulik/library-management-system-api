import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class UpdateRefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string | null;

  @IsInt()
  @IsNotEmpty()
  readonly userId: number;
}
