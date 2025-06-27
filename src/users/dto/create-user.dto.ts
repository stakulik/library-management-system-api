import { IsString, MinLength, IsNotEmpty } from 'class-validator';

import { EmailField, NameField } from '../../common';

export class CreateUserDto {
  @EmailField()
  readonly email: string;

  @NameField()
  readonly firstName: string;

  @NameField()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  readonly password: string;
}
