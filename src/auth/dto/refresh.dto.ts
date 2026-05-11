import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class RefreshDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Refresh токен обязателен' })
  refreshToken: string;
}
