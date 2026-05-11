import {
  Controller,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  StorageImageUrl,
  StorageOrderFileWithUrl,
  StorageService,
} from './storage.service';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post(':id/files')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') id: string,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({ maxSize: 10 * 1024 * 1024 })
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp|pdf)$/i,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ): Promise<StorageOrderFileWithUrl> {
    return this.storageService.uploadOrderFileAndSave(id, file);
  }

  @Get(':id/files')
  getFiles(@Param('id') id: string): Promise<StorageOrderFileWithUrl[]> {
    return this.storageService.getOrderFiles(id);
  }

  @Get('img/:fileName')
  getImage(@Param('fileName') fileName: string): Promise<StorageImageUrl> {
    return this.storageService.getImageUrl(fileName);
  }

  @Get('img')
  getImages(@Query('count') count = '10'): Promise<StorageImageUrl[]> {
    return this.storageService.getImages(Number(count));
  }
}
