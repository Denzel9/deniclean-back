import { ApiProperty } from '@nestjs/swagger';

export class StorageOrderFileWithUrlDto {
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

  @ApiProperty()
  url: string;
}

export class StorageImageUrlDto {
  @ApiProperty()
  key: string;

  @ApiProperty()
  url: string;

  @ApiProperty()
  expiresIn: number;
}

export class StorageImagesResponseDto {
  @ApiProperty({
    type: () => [StorageImageUrlDto],
  })
  data: StorageImageUrlDto[];

  @ApiProperty()
  hasMore: boolean;
}
