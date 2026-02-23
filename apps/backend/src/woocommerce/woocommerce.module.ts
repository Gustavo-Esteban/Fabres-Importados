import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { WoocommerceService } from './woocommerce.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [WoocommerceService],
  exports: [WoocommerceService],
})
export class WoocommerceModule {}
