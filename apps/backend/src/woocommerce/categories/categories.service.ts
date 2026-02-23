import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { WoocommerceService } from '../woocommerce.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly woo: WoocommerceService) {}

  findAll(parent?: number): Observable<unknown> {
    const params: Record<string, string | number> = {
      per_page: 100,
      hide_empty: 0,
    };
    if (parent !== undefined) {
      params['parent'] = parent;
    }
    return this.woo.get('/products/categories', params);
  }
}
