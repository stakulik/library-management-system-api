import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, Length } from 'class-validator';

export function NameField() {
  return applyDecorators(IsNotEmpty(), Length(3, 20));
}
