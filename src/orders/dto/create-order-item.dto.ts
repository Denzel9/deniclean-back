import { MeasurementType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({
    example: 'Диван',
    maxLength: 120,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiProperty({
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    enum: MeasurementType,
  })
  @IsOptional()
  @IsEnum(MeasurementType)
  measurementType?: MeasurementType;

  @ApiPropertyOptional({
    example: 2.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lengthMeters?: number;

  @ApiPropertyOptional({
    example: 1.8,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  widthMeters?: number;

  @ApiPropertyOptional({
    example: 4.5,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  squareMeters?: number;

  @ApiProperty({
    example: 1500,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  price: number;
}
