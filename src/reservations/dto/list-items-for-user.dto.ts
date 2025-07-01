import { IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

import { ListItemsDto } from '../../shared';

export class ListReservationsForUserDto extends ListItemsDto {
  @IsNotEmpty()
  @Type(() => Number)
  readonly userId: number;
}
