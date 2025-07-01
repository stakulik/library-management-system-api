import { IsEnum } from 'class-validator';

import { ReservationStatus } from '../interfaces';

export class UpdateReservationStatusDto {
  @IsEnum(ReservationStatus)
  status: ReservationStatus;
}
