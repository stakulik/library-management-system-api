import { NameField } from '../../common';

export class CreateAuthorDto {
  @NameField()
  readonly firstName: string;

  @NameField()
  readonly lastName: string;
}
