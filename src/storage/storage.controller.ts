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
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import {
  StorageImageUrl,
  StorageOrderFileWithUrl,
  StorageService,
} from './storage.service';
import {
  StorageImagesResponseDto,
  StorageImageUrlDto,
  StorageOrderFileWithUrlDto,
} from './dto/storage-response.dto';
import { GetImagesQueryDto } from './dto/get-images-query.dto';
import { IdParamDto } from '../common/dto/id-param.dto';
import { FileNameParamDto } from './dto/file-name-param.dto';

@ApiTags('Хранилище')
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post(':id/files')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Загрузить файл для заказа' })
  @ApiParam({ name: 'id', type: String })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiOkResponse({ type: StorageOrderFileWithUrlDto })
  async uploadFile(
    @Param() params: IdParamDto,
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
    return this.storageService.uploadOrderFileAndSave(params.id, file);
  }

  @Get(':id/files')
  @ApiOperation({ summary: 'Получить файлы по ID заказа' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: StorageOrderFileWithUrlDto, isArray: true })
  getFiles(@Param() params: IdParamDto): Promise<StorageOrderFileWithUrl[]> {
    return this.storageService.getOrderFiles(params.id);
  }

  @Get('img/:fileName')
  @ApiOperation({
    summary: 'Получить подписанный URL изображения по имени файла',
  })
  @ApiParam({ name: 'fileName', type: String })
  @ApiOkResponse({ type: StorageImageUrlDto })
  getImage(@Param() params: FileNameParamDto): Promise<StorageImageUrl> {
    return this.storageService.getImageUrl(params.fileName);
  }

  @Get('img')
  @ApiOperation({
    summary: 'Получить пагинированный список подписанных URL изображений',
  })
  @ApiOkResponse({ type: StorageImagesResponseDto })
  getImages(
    @Query() query: GetImagesQueryDto,
  ): Promise<{ data: StorageImageUrl[]; hasMore: boolean }> {
    return this.storageService.getImages(query.count ?? 10, query.offset ?? 0);
  }
}
