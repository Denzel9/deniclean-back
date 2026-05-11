import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type StorageOrderFileWithUrl = {
  id: string;
  orderId: string;
  key: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt: Date;
  url: string;
};

export type StorageImageUrl = {
  key: string;
  url: string;
  expiresIn: number;
};

@Injectable()
export class StorageService {
  private readonly bucket: string;
  private readonly endpoint: string;
  private readonly publicBaseUrl?: string;
  private readonly client: S3Client;

  constructor(private readonly prisma: PrismaService) {
    this.bucket = process.env.S3_BUCKET;
    this.endpoint = process.env.S3_ENDPOINT;
    this.publicBaseUrl = process.env.S3_PUBLIC_BASE_URL;

    this.client = new S3Client({
      endpoint: this.endpoint,
      region: process.env.S3_REGION,
      forcePathStyle: true,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      },
    });
  }

  async uploadOrderFile(
    buffer: Buffer,
    key: string,
    contentType: string,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );
  }

  async deleteObject(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );
  }

  buildObjectUrl(key: string): string {
    if (this.publicBaseUrl) {
      return `${this.publicBaseUrl.replace(/\/$/, '')}/${key}`;
    }

    return `${this.endpoint.replace(/\/$/, '')}/${this.bucket}/${key}`;
  }

  async uploadOrderFileAndSave(
    orderId: string,
    file: Express.Multer.File,
  ): Promise<StorageOrderFileWithUrl> {
    await this.ensureOrderExists(orderId);

    const key = this.buildOrderFileKey(orderId, file.originalname);
    await this.uploadOrderFile(file.buffer, key, file.mimetype);

    const createdFile = await this.prisma.orderFile.create({
      data: {
        orderId,
        key,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    });

    return {
      ...createdFile,
      url: this.buildObjectUrl(createdFile.key),
    };
  }

  async getOrderFiles(orderId: string): Promise<StorageOrderFileWithUrl[]> {
    await this.ensureOrderExists(orderId);

    const files = await this.prisma.orderFile.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' },
    });

    return files.map((file) => ({
      ...file,
      url: this.buildObjectUrl(file.key),
    }));
  }

  async getImages(count: number): Promise<StorageImageUrl[]> {
    if (!Number.isInteger(count) || count <= 0) {
      throw new BadRequestException('count must be a positive integer');
    }

    if (count > 50) {
      throw new BadRequestException(
        'count is too large. Maximum allowed value is 50',
      );
    }

    const worksFilePattern = /^img\/works(\d+)(\.[a-z0-9]+)?$/i;
    const allKeys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const objects = await this.client.send(
        new ListObjectsV2Command({
          Bucket: this.bucket,
          Prefix: 'img/',
          MaxKeys: 1000,
          ContinuationToken: continuationToken,
        }),
      );

      const keys = (objects.Contents ?? [])
        .map((item) => item.Key)
        .filter((key): key is string => Boolean(key && key !== 'img/'));
      allKeys.push(...keys);

      continuationToken = objects.IsTruncated
        ? objects.NextContinuationToken
        : undefined;
    } while (continuationToken);

    const matchedFiles = allKeys
      .map((key) => {
        const match = key.match(worksFilePattern);
        if (!match) {
          return null;
        }

        return {
          key,
          order: Number(match[1]),
        };
      })
      .filter((item): item is { key: string; order: number } => item !== null);

    matchedFiles.sort((a, b) => a.order - b.order);

    return Promise.all(
      matchedFiles
        .slice(0, count)
        .map((item) => this.buildSignedImageByKey(item.key)),
    );
  }

  async getImageUrl(fileName: string): Promise<StorageImageUrl> {
    const sanitizedFileName = this.sanitizeObjectName(fileName);

    if (!sanitizedFileName) {
      throw new BadRequestException('fileName must not be empty');
    }

    const key = `img/${sanitizedFileName}`;
    return this.buildSignedImageByKey(key);
  }

  private async ensureOrderExists(orderId: string): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${orderId} not found`);
    }
  }

  private buildOrderFileKey(orderId: string, originalName: string): string {
    const sanitizedName = this.sanitizeObjectName(originalName);

    return `orders/${orderId}/${Date.now()}-${sanitizedName}`;
  }

  private sanitizeObjectName(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9.\-_]/g, '');
  }

  private async buildSignedImageByKey(key: string): Promise<StorageImageUrl> {
    const expiresIn = 60 * 15;
    const url = await getSignedUrl(
      this.client,
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
      { expiresIn },
    );

    return {
      key,
      url,
      expiresIn,
    };
  }
}
