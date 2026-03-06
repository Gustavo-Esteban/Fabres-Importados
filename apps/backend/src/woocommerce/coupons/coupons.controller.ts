import { Controller, Get, Param } from '@nestjs/common';
import { Observable } from 'rxjs';
import { CouponsService, CouponDto } from './coupons.service';

@Controller('cupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get(':code')
  validate(@Param('code') code: string): Observable<CouponDto> {
    return this.couponsService.validate(code);
  }
}
