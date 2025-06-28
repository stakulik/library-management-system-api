import { IsInt, IsString, IsNotEmpty } from 'class-validator';

export class RefreshTokensDto {
  @IsString()
  @IsNotEmpty()
  readonly refreshToken: string;

  @IsInt()
  @IsNotEmpty()
  readonly userId: number;
}
