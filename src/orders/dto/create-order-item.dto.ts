import { MeasurementType } from '@prisma/client';
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
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsEnum(MeasurementType)
  measurementType?: MeasurementType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lengthMeters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  widthMeters?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  squareMeters?: number;

  @IsInt()
  @Min(0)
  price: number;
}
