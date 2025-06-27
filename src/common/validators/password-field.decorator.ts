import { applyDecorators } from '@nestjs/common';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export function PasswordField() {
  return applyDecorators(MinLength(6), IsNotEmpty(), IsString());
}
