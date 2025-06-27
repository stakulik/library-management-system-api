import { applyDecorators } from '@nestjs/common';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export function EmailField() {
  return applyDecorators(IsEmail(), IsNotEmpty(), IsString());
}
