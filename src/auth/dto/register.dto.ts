import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MinLength(2, { message: 'Имя должно быть не короче 2 символов' })
  @MaxLength(50, { message: 'Имя должно быть не длиннее 50 символов' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @Matches(/^\+?[0-9]{10,15}$/, {
    message: 'Телефон должен быть в формате +79991234567',
  })
  phone: string;

  @IsString()
  @MinLength(6, { message: 'Пароль должен быть не короче 6 символов' })
  password: string;
}
