import { EmailField, NameField, PasswordField } from '../../common';

export class CreateUserDto {
  @EmailField()
  readonly email: string;

  @NameField()
  readonly firstName: string;

  @NameField()
  readonly lastName: string;

  @PasswordField()
  readonly password: string;
}
