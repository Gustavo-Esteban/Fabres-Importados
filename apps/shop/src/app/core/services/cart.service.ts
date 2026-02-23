import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly CART_KEY = 'fabres_cart';
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly cartSubject = new BehaviorSubject<CartItem[]>(
    this.loadFromStorage(),
  );

  readonly cart$ = this.cartSubject.asObservable();

  readonly count$ = this.cart$.pipe(
    map((items) => items.reduce((sum, i) => sum + i.quantity, 0)),
  );

  readonly total$ = this.cart$.pipe(
    map((items) => items.reduce((sum, i) => sum + i.price * i.quantity, 0)),
  );

  get items(): CartItem[] {
    return this.cartSubject.value;
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

  clearCart(): void {
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
}
