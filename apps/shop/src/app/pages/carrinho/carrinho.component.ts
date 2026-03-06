import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../core/services/cart.service';
import { WooService } from '../../core/services/woo.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-carrinho',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="carrinho">
      <div class="carrinho__header">
        <p class="section-subtitle">Suas Escolhas</p>
        <h1 class="section-title">Meu Carrinho</h1>
        <div class="gold-divider"></div>
      </div>

      @if (items()?.length) {
        <div class="carrinho__layout">
          <!-- Items list -->
          <div class="carrinho__items">
            @for (item of items(); track item.productId) {
              <div class="item">
                <div class="item__img-wrap">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.name" class="item__img" />
                  } @else {
                    <div class="item__img-ph"></div>
                  }
                </div>

                <div class="item__info">
                  <p class="item__name">{{ item.name }}</p>
                  <p class="item__price">R$ {{ item.price | number:'1.2-2' }}</p>
                </div>

                <div class="item__controls">
                  <div class="qty">
                    <button class="qty__btn" (click)="decQty(item)">−</button>
                    <span class="qty__val">{{ item.quantity }}</span>
                    <button class="qty__btn" (click)="incQty(item)">+</button>
                  </div>
                  <p class="item__subtotal">
                    R$ {{ (item.price * item.quantity) | number:'1.2-2' }}
                  </p>
                  <button class="item__remove" (click)="remover(item.productId)" aria-label="Remover">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="1.5">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
            }

            <button class="limpar-btn" (click)="limpar()">Limpar carrinho</button>
          </div>

          <!-- Summary -->
          <aside class="carrinho__summary">
            <h2 class="summary__title">Resumo do Pedido</h2>

            <div class="summary__row">
              <span>Subtotal</span>
              <span>R$ {{ total() | number:'1.2-2' }}</span>
            </div>
            <div class="summary__row summary__row--shipping">
              <span>Frete</span>
              <span class="summary__free">A calcular</span>
            </div>

            @if (coupon()) {
              <div class="summary__row summary__row--discount">
                <span>Desconto</span>
                <span class="summary__discount">-R$ {{ discount() | number:'1.2-2' }}</span>
              </div>
            }

            <div class="summary__divider"></div>
            <div class="summary__row summary__row--total">
              <span>Total</span>
              <span>R$ {{ finalTotal() | number:'1.2-2' }}</span>
            </div>

            <!-- Seção de cupom -->
            <div class="coupon">
              @if (coupon()) {
                <div class="coupon__applied">
                  <div class="coupon__applied-info">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                         stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <span class="coupon__code">{{ coupon()!.code.toUpperCase() }}</span>
                  </div>
                  <button class="coupon__remove" (click)="removerCupom()" aria-label="Remover cupom">×</button>
                </div>
              } @else {
                <div class="coupon__form">
                  <input
                    type="text"
                    [(ngModel)]="codigoCupom"
                    placeholder="Código de cupom"
                    class="coupon__input"
                    [disabled]="cupomLoading()"
                    (keydown.enter)="aplicarCupom()"
                  />
                  <button
                    class="coupon__btn"
                    (click)="aplicarCupom()"
                    [disabled]="!codigoCupom.trim() || cupomLoading()"
                  >
                    @if (cupomLoading()) {
                      <span class="coupon__spinner"></span>
                    } @else {
                      Aplicar
                    }
                  </button>
                </div>
                @if (cupomErro()) {
                  <p class="coupon__error">Cupom inválido ou não encontrado.</p>
                }
              }
            </div>

            <a routerLink="/checkout" class="btn-gold summary__cta">
              Finalizar Compra
            </a>
            <a routerLink="/loja" class="summary__continue">
              ← Continuar comprando
            </a>
          </aside>
        </div>
      } @else {
        <div class="carrinho__empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="1" opacity="0.3">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
            <line x1="3" y1="6" x2="21" y2="6"/>
            <path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
          <p>Seu carrinho está vazio.</p>
          <a routerLink="/loja" class="btn-gold">Explorar Coleção</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .carrinho {
      max-width: 1280px;
      margin: 0 auto;
      padding: 60px 24px 80px;
    }

    .carrinho__header {
      text-align: center;
      margin-bottom: 48px;
    }

    /* Layout */
    .carrinho__layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 40px;
      align-items: start;
    }

    /* Items */
    .carrinho__items {
      display: flex;
      flex-direction: column;
      gap: 1px;
      background: var(--color-deep-gray);
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-md);
      overflow: hidden;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 20px 24px;
      background: var(--color-charcoal);
    }

    .item__img-wrap {
      width: 80px;
      height: 80px;
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--color-deep-gray);
    }

    .item__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .item__img-ph {
      width: 100%;
      height: 100%;
      background: var(--color-mid-gray);
    }

    .item__info {
      flex: 1;
      min-width: 0;
    }

    .item__name {
      font-family: var(--font-display);
      font-size: 0.95rem;
      color: var(--color-cream);
      margin-bottom: 6px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .item__price {
      font-family: var(--font-label);
      font-size: 0.82rem;
      color: var(--color-muted);
    }

    .item__controls {
      display: flex;
      align-items: center;
      gap: 20px;
      flex-shrink: 0;
    }

    .qty {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-sm);
    }

    .qty__btn {
      width: 34px;
      height: 34px;
      background: var(--color-deep-gray);
      color: var(--color-cream);
      font-size: 1rem;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition);
    }

    .qty__btn:hover { background: var(--color-mid-gray); }

    .qty__val {
      width: 36px;
      text-align: center;
      font-size: 0.9rem;
      color: var(--color-cream);
    }

    .item__subtotal {
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-cream);
      min-width: 90px;
      text-align: right;
    }

    .item__remove {
      background: transparent;
      border: none;
      color: var(--color-mid-gray);
      cursor: pointer;
      transition: color var(--transition);
      padding: 4px;
      display: flex;
    }

    .item__remove:hover { color: var(--color-error, #e74c3c); }

    .limpar-btn {
      align-self: flex-start;
      background: transparent;
      border: none;
      color: var(--color-mid-gray);
      font-family: var(--font-label);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      padding: 16px 24px;
      transition: color var(--transition);
    }

    .limpar-btn:hover { color: var(--color-error, #e74c3c); }

    /* Summary */
    .carrinho__summary {
      background: var(--color-charcoal);
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-md);
      padding: 28px;
      position: sticky;
      top: 90px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .summary__title {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-cream);
      margin-bottom: 4px;
    }

    .summary__row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-family: var(--font-label);
      font-size: 0.9rem;
      color: var(--color-muted);
    }

    .summary__row--total {
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-cream);
    }

    .summary__free { color: var(--color-gold); font-size: 0.8rem; }

    .summary__discount {
      color: #4caf50;
      font-weight: 600;
    }

    .summary__divider {
      height: 1px;
      background: var(--color-deep-gray);
    }

    /* Cupom */
    .coupon {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .coupon__form {
      display: flex;
      gap: 8px;
    }

    .coupon__input {
      flex: 1;
      padding: 9px 12px;
      background: var(--color-obsidian, #0a0a0a);
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-sm);
      color: var(--color-cream);
      font-family: var(--font-body);
      font-size: 0.85rem;
      outline: none;
      transition: border-color var(--transition);
      text-transform: uppercase;
    }

    .coupon__input:focus { border-color: var(--color-gold); }
    .coupon__input::placeholder { color: var(--color-muted); text-transform: none; }
    .coupon__input:disabled { opacity: 0.5; cursor: not-allowed; }

    .coupon__btn {
      padding: 9px 14px;
      background: transparent;
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-sm);
      color: var(--color-muted);
      font-family: var(--font-label);
      font-size: 0.75rem;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      cursor: pointer;
      transition: border-color var(--transition), color var(--transition);
      white-space: nowrap;
      display: flex;
      align-items: center;
      justify-content: center;
      min-width: 72px;
    }

    .coupon__btn:hover:not(:disabled) {
      border-color: var(--color-gold);
      color: var(--color-gold);
    }

    .coupon__btn:disabled { opacity: 0.4; cursor: not-allowed; }

    .coupon__spinner {
      width: 14px;
      height: 14px;
      border: 2px solid var(--color-deep-gray);
      border-top-color: var(--color-gold);
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .coupon__error {
      font-family: var(--font-label);
      font-size: 0.75rem;
      color: var(--color-error, #e74c3c);
      letter-spacing: 0.05em;
    }

    .coupon__applied {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 12px;
      background: rgba(76, 175, 80, 0.08);
      border: 1px solid rgba(76, 175, 80, 0.3);
      border-radius: var(--radius-sm);
    }

    .coupon__applied-info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
    }

    .coupon__code {
      font-family: var(--font-label);
      font-size: 0.8rem;
      letter-spacing: 0.12em;
      color: #4caf50;
    }

    .coupon__remove {
      background: transparent;
      border: none;
      color: var(--color-muted);
      font-size: 1.1rem;
      cursor: pointer;
      line-height: 1;
      padding: 0 2px;
      transition: color var(--transition);
    }

    .coupon__remove:hover { color: var(--color-error, #e74c3c); }

    .summary__cta {
      display: block;
      text-align: center;
      padding: 14px;
      font-size: 0.85rem;
      margin-top: 4px;
    }

    .summary__continue {
      text-align: center;
      font-family: var(--font-label);
      font-size: 0.78rem;
      letter-spacing: 0.1em;
      color: var(--color-muted);
      transition: color var(--transition);
    }

    .summary__continue:hover { color: var(--color-gold); }

    /* Empty */
    .carrinho__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 24px;
      padding: 80px 0;
      color: var(--color-muted);
      font-family: var(--font-label);
      font-size: 1rem;
      letter-spacing: 0.1em;
    }

    @media (max-width: 900px) {
      .carrinho__layout { grid-template-columns: 1fr; }
      .carrinho__summary { position: static; }
    }

    @media (max-width: 600px) {
      .item { flex-wrap: wrap; }
      .item__controls { width: 100%; justify-content: space-between; }
    }
  `],
})
export class CarrinhoComponent {
  private readonly cartService = inject(CartService);
  private readonly woo = inject(WooService);

  readonly items = toSignal(this.cartService.cart$, { initialValue: [] as CartItem[] });
  readonly total = toSignal(this.cartService.total$, { initialValue: 0 });
  readonly discount = toSignal(this.cartService.discount$, { initialValue: 0 });
  readonly finalTotal = toSignal(this.cartService.finalTotal$, { initialValue: 0 });
  readonly coupon = toSignal(this.cartService.coupon$, { initialValue: null });

  codigoCupom = '';
  readonly cupomLoading = signal(false);
  readonly cupomErro = signal(false);

  incQty(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decQty(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity - 1);
  }

  remover(id: number): void {
    this.cartService.removeItem(id);
  }

  limpar(): void {
    this.cartService.clearCart();
  }

  aplicarCupom(): void {
    const code = this.codigoCupom.trim();
    if (!code || this.cupomLoading()) return;

    this.cupomLoading.set(true);
    this.cupomErro.set(false);

    this.woo.validarCupom(code).subscribe({
      next: (cupom) => {
        this.cartService.applyCoupon(cupom);
        this.codigoCupom = '';
        this.cupomLoading.set(false);
      },
      error: () => {
        this.cupomErro.set(true);
        this.cupomLoading.set(false);
      },
    });
  }

  removerCupom(): void {
    this.cartService.removeCoupon();
    this.codigoCupom = '';
    this.cupomErro.set(false);
  }
}
