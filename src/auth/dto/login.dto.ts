import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
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
    description: 'Пароль пользователя',
  })
  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}
