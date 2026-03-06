import { Controller, Post, Body } from '@nestjs/common';
import { OrdersService } from './orders.service';

export interface CreateOrderDto {
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  line_items: {
    product_id: number;
    quantity: number;
  }[];
  payment_method?: string;
  payment_method_title?: string;
  coupon_lines?: { code: string }[];
}

@Controller('pedidos')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }
}
