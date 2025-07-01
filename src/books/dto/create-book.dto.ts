import {
  IsNotEmpty,
  Length,
  IsString,
  IsOptional,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 20)
  readonly title: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsNotEmpty()
  @IsInt({ message: 'authorId must be an integer' })
  @Type(() => Number)
  readonly authorId: number;
}
