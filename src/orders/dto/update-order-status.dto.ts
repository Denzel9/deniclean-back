import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateOrderStatusDto {
  @ApiProperty({
    example: false,
    description: 'Заказ выполнен',
  })
  @IsBoolean()
  isCompleted: boolean;
}
