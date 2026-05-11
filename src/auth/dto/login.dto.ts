import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Телефон должен быть в формате +79991234567',
  })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль обязателен' })
  password: string;
}
