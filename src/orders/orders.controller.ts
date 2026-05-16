import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { Order } from '@prisma/client';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { IdParamDto } from '../common/dto/id-param.dto';
import { CustomerPhoneParamDto } from './dto/customer-phone-param.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@ApiTags('Заказы')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все заказы' })
  @ApiOkResponse({ type: OrderResponseDto, isArray: true })
  getAll(): Promise<Order[]> {
    return this.ordersService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiOkResponse({ type: OrderResponseDto })
  getById(@Param() params: IdParamDto): Promise<Order> {
    return this.ordersService.getById(params.id);
  }

  @Get('customer/:phone')
  @ApiOperation({ summary: 'Получить заказы по телефону клиента' })
  @ApiParam({ name: 'phone', type: String })
  @ApiOkResponse({ type: OrderResponseDto, isArray: true })
  getByCustomerPhone(@Param() params: CustomerPhoneParamDto): Promise<Order[]> {
    return this.ordersService.getByCustomerPhone(params.phone);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Изменить статус выполнения заказа' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiOkResponse({ type: OrderResponseDto })
  updateStatus(
    @Param() params: IdParamDto,
    @Body() dto: UpdateOrderStatusDto,
  ): Promise<Order> {
    return this.ordersService.updateStatus(params.id, dto);
  }

  @Post()
  @ApiOperation({ summary: 'Создать заказ' })
  @ApiBody({ type: CreateOrderDto })
  @ApiOkResponse({ type: OrderResponseDto })
  create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }
}
