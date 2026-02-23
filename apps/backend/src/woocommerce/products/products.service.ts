import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { WoocommerceService } from '../woocommerce.service';

export interface ProductFilters {
  categoria?: string;
  page?: number;
  perPage?: number;
  orderby?: string;
  busca?: string;
}

@Injectable()
export class ProductsService {
  constructor(private readonly woo: WoocommerceService) {}

  findAll(filters: ProductFilters): Observable<unknown> {
    const params: Record<string, string | number> = {
      status: 'publish',
      per_page: filters.perPage ?? 12,
      page: filters.page ?? 1,
      orderby: filters.orderby ?? 'date',
      order: 'desc',
    };

    if (filters.busca) {
      params['search'] = filters.busca;
    }

    if (!filters.categoria) {
      return this.woo.get('/products', params);
    }

    return this.woo.getCategoryIdBySlug(filters.categoria).pipe(
      switchMap((categoryId) => {
        if (categoryId !== null) {
          params['category'] = categoryId;
        }
        return this.woo.get('/products', params);
      }),
    );
  }

  findOne(id: number): Observable<unknown> {
    return this.woo.get(`/products/${id}`);
  }
}
