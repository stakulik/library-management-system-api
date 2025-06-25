import { IsOptional, IsNumberString, IsEnum } from 'class-validator';

import { ListDirection } from '../interfaces';

export class ListItemsDto {
  @IsOptional()
  @IsNumberString({}, { message: 'cursor must be a number' })
  cursor?: string;

  @IsOptional()
  @IsNumberString({}, { message: 'pageSize must be a number' })
  pageSize?: string;

  @IsOptional()
  @IsEnum(ListDirection)
  direction: ListDirection = ListDirection.Forward;
}
