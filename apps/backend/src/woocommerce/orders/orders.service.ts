import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WoocommerceService } from '../woocommerce.service';
import { CreateOrderDto } from './orders.controller';

@Injectable()
export class OrdersService {
  constructor(private readonly woo: WoocommerceService) {}

  create(orderData: CreateOrderDto): Observable<unknown> {
    const payload = {
      ...orderData,
      shipping: orderData.billing,
      status: 'pending',
      payment_method: orderData.payment_method ?? 'bacs',
      payment_method_title: orderData.payment_method_title ?? 'Transferência Bancária',
      set_paid: false,
    };
    return this.woo.post('/orders', payload);
  }
}
