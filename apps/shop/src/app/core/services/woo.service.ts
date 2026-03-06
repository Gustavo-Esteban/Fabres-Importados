import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppliedCoupon } from './cart.service';

export interface WcImage {
  id: number;
  src: string;
  alt: string;
}

export interface WcCategory {
  id: number;
  name: string;
  slug: string;
  image?: WcImage;
  count: number;
}

export interface WcProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  short_description: string;
  description: string;
  images: WcImage[];
  categories: WcCategory[];
  stock_status: 'instock' | 'outofstock' | 'onbackorder';
  status: string;
}

@Injectable({ providedIn: 'root' })
export class WooService {
  private readonly http = inject(HttpClient);
  private readonly base = environment.apiUrl;

  getProdutos(filters?: {
    categoria?: string;
    page?: number;
    busca?: string;
    per_page?: number;
  }): Observable<WcProduct[]> {
    let params = new HttpParams();
    if (filters?.categoria) params = params.set('categoria', filters.categoria);
    if (filters?.page)      params = params.set('page', String(filters.page));
    if (filters?.busca)     params = params.set('busca', filters.busca);
    if (filters?.per_page)  params = params.set('per_page', String(filters.per_page));
    return this.http.get<WcProduct[]>(`${this.base}/produtos`, { params });
  }

  getProduto(id: number): Observable<WcProduct> {
    return this.http.get<WcProduct>(`${this.base}/produtos/${id}`);
  }

  getCategorias(): Observable<WcCategory[]> {
    return this.http.get<WcCategory[]>(`${this.base}/categorias`);
  }

  criarPedido(pedido: unknown): Observable<unknown> {
    return this.http.post(`${this.base}/pedidos`, pedido);
  }

  validarCupom(code: string): Observable<AppliedCoupon> {
    return this.http.get<AppliedCoupon>(`${this.base}/cupons/${encodeURIComponent(code)}`);
  }
}
