import { IsNotEmpty, Length } from 'class-validator';

export class CreateBookDto {
  @IsNotEmpty()
  @Length(3, 20)
  readonly title: string;
}
