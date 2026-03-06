import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface AppliedCoupon {
  code: string;
  discountType: 'percent' | 'fixed_cart' | 'fixed_product';
  amount: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_KEY = 'fabres_cart';
  private readonly COUPON_KEY = 'fabres_coupon';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly cartSubject = new BehaviorSubject<CartItem[]>(
    this.loadFromStorage(),
  );

  private readonly couponSubject = new BehaviorSubject<AppliedCoupon | null>(
    this.loadCouponFromStorage(),
  );

  readonly cart$ = this.cartSubject.asObservable();
  readonly coupon$ = this.couponSubject.asObservable();

  readonly count$ = this.cart$.pipe(
    map((items) => items.reduce((sum, i) => sum + i.quantity, 0)),
  );

  readonly total$ = this.cart$.pipe(
    map((items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0)),
  );

  readonly discount$ = combineLatest([this.total$, this.coupon$]).pipe(
    map(([total, coupon]) => {
      if (!coupon) return 0;
      if (coupon.discountType === 'percent') {
        return Math.min(total, total * (coupon.amount / 100));
      }
      return Math.min(total, coupon.amount);
    }),
  );

  readonly finalTotal$ = combineLatest([this.total$, this.discount$]).pipe(
    map(([total, discount]) => Math.max(0, total - discount)),
  );

  get items(): CartItem[] {
    return this.cartSubject.value;
  }

  get coupon(): AppliedCoupon | null {
    return this.couponSubject.value;
  }

  addItem(item: Omit<CartItem, 'quantity'>): void {
    const current = this.cartSubject.value;
    const existing = current.find((i) => i.productId === item.productId);
    const updated = existing
      ? current.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + 1 }
            : i,
        )
      : [...current, { ...item, quantity: 1 }];
    this.saveAndEmit(updated);
  }

  removeItem(productId: number): void {
    this.saveAndEmit(
      this.cartSubject.value.filter((i) => i.productId !== productId),
    );
  }

  updateQuantity(productId: number, qty: number): void {
    if (qty <= 0) {
      this.removeItem(productId);
      return;
    }
    this.saveAndEmit(
      this.cartSubject.value.map((i) =>
        i.productId === productId ? { ...i, quantity: qty } : i,
      ),
    );
  }

  applyCoupon(coupon: AppliedCoupon): void {
    if (this.isBrowser) {
      localStorage.setItem(this.COUPON_KEY, JSON.stringify(coupon));
    }
    this.couponSubject.next(coupon);
  }

  removeCoupon(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.COUPON_KEY);
    }
    this.couponSubject.next(null);
  }

  clearCart(): void {
    this.removeCoupon();
    this.saveAndEmit([]);
  }

  private saveAndEmit(items: CartItem[]): void {
    if (this.isBrowser) {
      localStorage.setItem(this.CART_KEY, JSON.stringify(items));
    }
    this.cartSubject.next(items);
  }

  private loadFromStorage(): CartItem[] {
    if (!this.isBrowser) return [];
    try {
      const stored = localStorage.getItem(this.CART_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private loadCouponFromStorage(): AppliedCoupon | null {
    if (!this.isBrowser) return null;
    try {
      const stored = localStorage.getItem(this.COUPON_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
