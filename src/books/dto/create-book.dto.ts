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
  @Type(() => Number)
  @IsInt()
  readonly authorId: number;
}
