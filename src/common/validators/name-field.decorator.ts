import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, Length } from 'class-validator';

export function NameField() {
  return applyDecorators(IsNotEmpty(), IsString(), Length(3, 20));
}
