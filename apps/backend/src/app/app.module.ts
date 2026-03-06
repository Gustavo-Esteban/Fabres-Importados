import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { WoocommerceModule } from '../woocommerce/woocommerce.module';
import { ProductsModule } from '../woocommerce/products/products.module';
import { CategoriesModule } from '../woocommerce/categories/categories.module';
import { OrdersModule } from '../woocommerce/orders/orders.module';
import { CouponsModule } from '../woocommerce/coupons/coupons.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    WoocommerceModule,
    ProductsModule,
    CategoriesModule,
    OrdersModule,
    CouponsModule,
  ],
})
export class AppModule {}
