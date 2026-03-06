import { Injectable, NotFoundException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { WoocommerceService } from '../woocommerce.service';

export interface CouponDto {
  code: string;
  discountType: 'percent' | 'fixed_cart' | 'fixed_product';
  amount: number;
}

@Injectable()
export class CouponsService {
  constructor(private readonly woo: WoocommerceService) {}

  validate(code: string): Observable<CouponDto> {
    return this.woo
      .get<any[]>('/coupons', { code: code.toLowerCase(), per_page: 1 })
      .pipe(
        map((coupons) => {
          if (!coupons || !coupons.length) {
            throw new NotFoundException(`Cupom "${code}" inválido ou não encontrado`);
          }
          const c = coupons[0];
          return {
            code: c.code as string,
            discountType: c.discount_type as CouponDto['discountType'],
            amount: parseFloat(c.amount as string),
          };
        }),
      );
  }
}
