import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { Order } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  getAll(): Promise<Order[]> {
    return this.ordersService.getAll();
  }

  @Get(':id')
  getById(@Param('id') id: string): Promise<Order> {
    return this.ordersService.getById(id);
  }

  // TODO replace to customer id
  @Get('customer/:customerName')
  getByCustomerName(
    @Param('customerName') customerName: string,
  ): Promise<Order[]> {
    return this.ordersService.getByCustomerName(customerName);
  }

  @Post()
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }
}
