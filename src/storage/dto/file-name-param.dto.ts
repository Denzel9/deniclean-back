import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FileNameParamDto {
  @ApiProperty({
    example: 'works1.jpg',
  })
  @IsString()
  @IsNotEmpty()
  fileName: string;
}
