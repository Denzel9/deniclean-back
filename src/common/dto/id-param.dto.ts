import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class IdParamDto {
  @ApiProperty({
    format: 'uuid',
    example: '2d7c45ce-272e-4a06-9b70-b4ebc3d8e22d',
  })
  @IsUUID()
  id: string;
}
