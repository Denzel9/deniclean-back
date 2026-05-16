import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetImagesQueryDto {
  @ApiPropertyOptional({
    example: 10,
    description: 'Количество изображений в ответе',
    minimum: 1,
    default: 10,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(1)
  count?: number = 10;

  @ApiPropertyOptional({
    example: 0,
    description: 'Смещение для пагинации',
    minimum: 0,
    default: 0,
  })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
