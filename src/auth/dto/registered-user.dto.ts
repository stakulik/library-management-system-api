import { IsNotEmpty, IsInt } from 'class-validator';

export class RegisteredUserResponseDto {
  @IsNotEmpty()
  @IsInt()
  readonly id: number;
}
