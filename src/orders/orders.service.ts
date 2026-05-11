import { Injectable, NotFoundException } from '@nestjs/common';
import { Order } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

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

  // Get orders by customer name
  async getByCustomerName(customerName: string): Promise<Order[]> {
    return this.prisma.order.findMany({
      where: { customerName },
      include: {
        items: true,
        files: true,
      },
    });
  }

  // Create order
  async create(data: CreateOrderDto): Promise<Order> {
    return this.prisma.order.create({
      data: {
        ...data,
        items: {
          create: data.items,
        },
      },
    });
  }
}
