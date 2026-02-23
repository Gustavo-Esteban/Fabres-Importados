import { Injectable, HttpException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Injectable()
export class WoocommerceService {
  private readonly baseUrl: string;
  private readonly authHeader: string;
  private readonly slugToIdCache = new Map<string, number>();

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const ck = this.config.get<string>('WC_CONSUMER_KEY') ?? '';
    const cs = this.config.get<string>('WC_CONSUMER_SECRET') ?? '';
    const base = this.config.get<string>('WC_BASE_URL') ?? '';
    this.baseUrl = `${base}/wp-json/wc/v3`;
    this.authHeader =
      'Basic ' + Buffer.from(`${ck}:${cs}`).toString('base64');
  }

  get<T>(path: string, params: Record<string, string | number> = {}): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${path}`, {
        headers: { Authorization: this.authHeader },
        params,
      })
      .pipe(
        map((res) => res.data),
        catchError((err) =>
          throwError(
            () =>
              new HttpException(
                err.response?.data ?? 'Erro WooCommerce',
                err.response?.status ?? 500,
              ),
          ),
        ),
      );
  }

  post<T>(path: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${path}`, body, {
        headers: {
          Authorization: this.authHeader,
          'Content-Type': 'application/json',
        },
      })
      .pipe(
        map((res) => res.data),
        catchError((err) =>
          throwError(
            () =>
              new HttpException(
                err.response?.data ?? 'Erro WooCommerce',
                err.response?.status ?? 500,
              ),
          ),
        ),
      );
  }

  getCategoryIdBySlug(slug: string): Observable<number | null> {
    if (this.slugToIdCache.has(slug)) {
      const id = this.slugToIdCache.get(slug)!;
      return new Observable((obs) => { obs.next(id); obs.complete(); });
    }

    return this.get<{ id: number; slug: string }[]>('/products/categories', { slug, per_page: 10 }).pipe(
      map((cats) => {
        if (cats.length > 0) {
          this.slugToIdCache.set(slug, cats[0].id);
          return cats[0].id;
        }
        return null;
      }),
    );
  }
}
