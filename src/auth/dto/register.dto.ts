import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    example: 'Denis',
    description: 'Имя пользователя',
  })
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MinLength(2, { message: 'Имя должно быть не короче 2 символов' })
  @MaxLength(50, { message: 'Имя должно быть не длиннее 50 символов' })
  name: string;

  @ApiProperty({
    example: '+79991234567',
    description: 'Номер телефона пользователя',
  })
  @IsString()
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Телефон должен быть в формате +79991234567',
  })
  phone: string;

  @ApiProperty({
    example: 'secret123',
    minLength: 6,
    description: 'Пароль пользователя',
  })
  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не короче 6 символов' })
  password: string;
}
