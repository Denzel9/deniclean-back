import { MeasurementType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  quantity: number;

  @ApiPropertyOptional({
    enum: MeasurementType,
  })
  measurementType?: MeasurementType;

  @ApiPropertyOptional()
  lengthMeters?: number;

  @ApiPropertyOptional()
  widthMeters?: number;

  @ApiPropertyOptional()
  squareMeters?: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class OrderFileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  orderId: string;

  @ApiProperty()
  key: string;

  @ApiProperty()
  originalName: string;

  @ApiProperty()
  mimeType: string;

  @ApiProperty()
  size: number;

  @ApiProperty()
  createdAt: Date;
}

export class OrderResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional({ nullable: true })
  userId: string | null;

  @ApiPropertyOptional({ nullable: true })
  customerName: string | null;

  @ApiProperty()
  customerPhone: string;

  @ApiPropertyOptional({ nullable: true })
  customerAddress: string | null;

  @ApiPropertyOptional({ nullable: true })
  price: number | null;

  @ApiPropertyOptional({ nullable: true })
  discount: number | null;

  @ApiPropertyOptional({ nullable: true })
  total: number | null;

  @ApiProperty({
    example: false,
    description: 'Заказ выполнен',
  })
  isCompleted: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({
    type: () => [OrderItemResponseDto],
  })
  items: OrderItemResponseDto[];

  @ApiProperty({
    type: () => [OrderFileResponseDto],
  })
  files: OrderFileResponseDto[];
}
