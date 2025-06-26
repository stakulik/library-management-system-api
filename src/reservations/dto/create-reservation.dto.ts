import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReservationDto {
  @IsDateString({}, { message: 'dueDate must be a valid ISO-8601 date string' })
  @Type(() => Date)
  readonly dueDate!: Date;

  @IsNotEmpty()
  @IsInt({ message: 'bookId must be an integer' })
  @Type(() => Number)
  readonly bookId!: number;

  @IsNotEmpty()
  @IsInt({ message: 'userId must be an integer' })
  @Type(() => Number)
  readonly userId!: number;
}
