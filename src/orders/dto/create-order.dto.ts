import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateOrderItemDto } from './create-order-item.dto';

export class CreateOrderDto {
  @ApiPropertyOptional({
    example: '2d7c45ce-272e-4a06-9b70-b4ebc3d8e22d',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    example: 'Иван',
  })
  @IsString()
  @IsOptional()
  customerName?: string;

  @ApiProperty({
    example: '+79991234567',
  })
  @IsString()
  @IsNotEmpty()
  customerPhone: string;

  @ApiPropertyOptional({
    example: 'Москва, Тверская 1',
  })
  @IsString()
  @IsOptional()
  customerAddress?: string;

  @ApiPropertyOptional({
    type: () => [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  @IsOptional()
  items?: CreateOrderItemDto[];

  @ApiPropertyOptional({
    example: 6500,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  price?: number;

  @ApiPropertyOptional({
    example: 500,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  discount?: number;

  @ApiPropertyOptional({
    example: 6000,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  total?: number;

  @ApiPropertyOptional({
    example: false,
    description: 'Заказ выполнен (если не передано — считается невыполненным)',
  })
  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}
