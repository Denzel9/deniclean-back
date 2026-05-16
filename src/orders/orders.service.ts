import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { TelegramService } from '../telegram/telegram.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { buildOrderTelegramMessage } from './utils/order-telegram-message.util';

type OrderWithRelations = Prisma.OrderGetPayload<{
  include: {
    items: true;
    files: true;
  };
}>;

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly telegramService: TelegramService,
  ) {}

  // Get all orders
  async getAll(): Promise<Order[]> {
    return this.prisma.order.findMany({
      include: {
        items: true,
        files: true,
      },
    });
  }

  // Get order by id
  async getById(id: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        files: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return order;
  }

  // Get orders by customer phone
  async getByCustomerPhone(phone: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { customerPhone: phone },
      include: {
        items: true,
        files: true,
      },
    });
  }

  // Create order
  async create(data: CreateOrderDto): Promise<Order> {
    const { items, ...orderData } = data;
    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        ...(items?.length
          ? {
              items: {
                create: items,
              },
            }
          : {}),
      },
      include: {
        items: true,
        files: true,
      },
    });

    void this.notifyOrderCreated(order);

    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order> {
    const existing = await this.prisma.order.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException(`Order with id ${id} not found`);
    }

    return this.prisma.order.update({
      where: { id },
      data: { isCompleted: dto.isCompleted },
      include: {
        items: true,
        files: true,
      },
    });
  }

  private async notifyOrderCreated(order: OrderWithRelations): Promise<void> {
    try {
      const message = buildOrderTelegramMessage(order);
      const photoUrls = await Promise.all(
        order.files.map((file) =>
          this.storageService.buildSignedObjectUrl(file.key),
        ),
      );

      await this.telegramService.notifyOrderCreated(message, photoUrls);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(
        `Failed to send Telegram notification for order ${order.id}: ${message}`,
      );
    }
  }
}
