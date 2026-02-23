import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { CartService } from '../../core/services/cart.service';
import { WooService } from '../../core/services/woo.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="checkout">
      @if (pedidoCriado()) {
        <!-- Sucesso -->
        <div class="checkout__success">
          <div class="success__icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="1.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <h1 class="success__title">Pedido Confirmado!</h1>
          <p class="success__text">
            Seu pedido foi enviado com sucesso. Em breve você receberá
            uma confirmação por e-mail.
          </p>
          <p class="success__order">Pedido nº {{ pedidoId() }}</p>
          <a routerLink="/" class="btn-gold">Voltar ao início</a>
        </div>
      } @else {
        <div class="checkout__header">
          <p class="section-subtitle">Finalizar Compra</p>
          <h1 class="section-title">Checkout</h1>
          <div class="gold-divider"></div>
        </div>

        <div class="checkout__layout">
          <!-- Form -->
          <form class="checkout__form" (ngSubmit)="onSubmit()">
            <fieldset class="form__section">
              <legend class="form__legend">Dados Pessoais</legend>
              <div class="form__row">
                <div class="form__group">
                  <label class="form__label">Nome *</label>
                  <input class="form__input" [(ngModel)]="form.firstName"
                         name="firstName" required placeholder="Seu nome" />
                </div>
                <div class="form__group">
                  <label class="form__label">Sobrenome *</label>
                  <input class="form__input" [(ngModel)]="form.lastName"
                         name="lastName" required placeholder="Seu sobrenome" />
                </div>
              </div>
              <div class="form__row">
                <div class="form__group">
                  <label class="form__label">E-mail *</label>
                  <input class="form__input" type="email" [(ngModel)]="form.email"
                         name="email" required placeholder="email@exemplo.com" />
                </div>
                <div class="form__group">
                  <label class="form__label">Telefone *</label>
                  <input class="form__input" [(ngModel)]="form.phone"
                         name="phone" required placeholder="(00) 00000-0000" />
                </div>
              </div>
            </fieldset>

            <fieldset class="form__section">
              <legend class="form__legend">Endereço de Entrega</legend>
              <div class="form__row">
                <div class="form__group form__group--sm">
                  <label class="form__label">CEP *</label>
                  <input class="form__input" [(ngModel)]="form.postcode"
                         name="postcode" required placeholder="00000-000" />
                </div>
                <div class="form__group">
                  <label class="form__label">Rua / Avenida *</label>
                  <input class="form__input" [(ngModel)]="form.address1"
                         name="address1" required placeholder="Nome da rua" />
                </div>
              </div>
              <div class="form__row">
                <div class="form__group form__group--sm">
                  <label class="form__label">Número *</label>
                  <input class="form__input" [(ngModel)]="form.address2"
                         name="address2" placeholder="123" />
                </div>
                <div class="form__group">
                  <label class="form__label">Bairro *</label>
                  <input class="form__input" [(ngModel)]="form.neighborhood"
                         name="neighborhood" required placeholder="Bairro" />
                </div>
              </div>
              <div class="form__row">
                <div class="form__group">
                  <label class="form__label">Cidade *</label>
                  <input class="form__input" [(ngModel)]="form.city"
                         name="city" required placeholder="Cidade" />
                </div>
                <div class="form__group form__group--sm">
                  <label class="form__label">Estado *</label>
                  <select class="form__input" [(ngModel)]="form.state" name="state" required>
                    <option value="">UF</option>
                    @for (uf of estados; track uf) {
                      <option [value]="uf">{{ uf }}</option>
                    }
                  </select>
                </div>
              </div>
            </fieldset>

            @if (erroSubmit()) {
              <div class="form__error">
                Erro ao criar pedido. Por favor tente novamente.
              </div>
            }

            <button
              type="submit"
              class="checkout__submit btn-gold"
              [disabled]="enviando()"
            >
              @if (enviando()) {
                Enviando pedido...
              } @else {
                Confirmar Pedido
              }
            </button>
          </form>

          <!-- Order summary -->
          <aside class="checkout__summary">
            <h2 class="summary__title">Seu Pedido</h2>

            @for (item of items(); track item.productId) {
              <div class="summary__item">
                <div class="summary__item-img">
                  @if (item.imageUrl) {
                    <img [src]="item.imageUrl" [alt]="item.name" />
                  }
                </div>
                <div class="summary__item-info">
                  <p class="summary__item-name">{{ item.name }}</p>
                  <p class="summary__item-qty">× {{ item.quantity }}</p>
                </div>
                <p class="summary__item-price">
                  R$ {{ (item.price * item.quantity) | number:'1.2-2' }}
                </p>
              </div>
            }

            <div class="summary__divider"></div>
            <div class="summary__total">
              <span>Total</span>
              <span class="summary__total-value">
                R$ {{ total() | number:'1.2-2' }}
              </span>
            </div>
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .checkout {
      max-width: 1280px;
      margin: 0 auto;
      padding: 60px 24px 80px;
    }

    .checkout__header {
      text-align: center;
      margin-bottom: 48px;
    }

    .checkout__layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 40px;
      align-items: start;
    }

    /* Form */
    .checkout__form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form__section {
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-md);
      padding: 24px;
      background: var(--color-charcoal);
    }

    .form__legend {
      font-family: var(--font-label);
      font-size: 0.75rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--color-gold);
      padding: 0 8px;
    }

    .form__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-top: 16px;
    }

    .form__group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form__group--sm { max-width: 160px; }

    .form__label {
      font-family: var(--font-label);
      font-size: 0.72rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-muted);
    }

    .form__input {
      width: 100%;
      padding: 11px 14px;
      background: var(--color-obsidian);
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-sm);
      color: var(--color-cream);
      font-family: var(--font-body);
      font-size: 0.9rem;
      outline: none;
      transition: border-color var(--transition);
    }

    .form__input:focus { border-color: var(--color-gold); }

    .form__input::placeholder { color: var(--color-mid-gray); }

    .form__error {
      padding: 14px 16px;
      background: rgba(231,76,60,0.1);
      border: 1px solid var(--color-error, #e74c3c);
      border-radius: var(--radius-sm);
      color: var(--color-error, #e74c3c);
      font-family: var(--font-label);
      font-size: 0.85rem;
    }

    .checkout__submit {
      width: 100%;
      padding: 16px;
      font-size: 0.9rem;
      text-align: center;
    }

    .checkout__submit:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    /* Summary sidebar */
    .checkout__summary {
      background: var(--color-charcoal);
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-md);
      padding: 24px;
      position: sticky;
      top: 90px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .summary__title {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-weight: 600;
      color: var(--color-cream);
    }

    .summary__item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .summary__item-img {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--color-deep-gray);
    }

    .summary__item-img img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .summary__item-info { flex: 1; min-width: 0; }

    .summary__item-name {
      font-family: var(--font-label);
      font-size: 0.82rem;
      color: var(--color-cream);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .summary__item-qty {
      font-size: 0.75rem;
      color: var(--color-muted);
    }

    .summary__item-price {
      font-family: var(--font-body);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-cream);
      flex-shrink: 0;
    }

    .summary__divider {
      height: 1px;
      background: var(--color-deep-gray);
    }

    .summary__total {
      display: flex;
      justify-content: space-between;
      font-family: var(--font-label);
      font-size: 0.9rem;
      color: var(--color-muted);
    }

    .summary__total-value {
      font-family: var(--font-body);
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--color-gold);
    }

    /* Success */
    .checkout__success {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 80px 24px;
      text-align: center;
    }

    .success__icon {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      border: 1px solid var(--color-gold);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-gold);
    }

    .success__title {
      font-family: var(--font-display);
      font-size: 2rem;
      color: var(--color-cream);
    }

    .success__text {
      color: var(--color-muted);
      max-width: 420px;
      line-height: 1.7;
    }

    .success__order {
      font-family: var(--font-label);
      font-size: 0.85rem;
      letter-spacing: 0.15em;
      color: var(--color-gold);
    }

    @media (max-width: 900px) {
      .checkout__layout { grid-template-columns: 1fr; }
      .checkout__summary { position: static; }
    }

    @media (max-width: 600px) {
      .form__row { grid-template-columns: 1fr; }
      .form__group--sm { max-width: 100%; }
    }
  `],
})
export class CheckoutComponent {
  private readonly cartService = inject(CartService);
  private readonly woo = inject(WooService);
  private readonly router = inject(Router);

  readonly items = toSignal(this.cartService.cart$, { initialValue: [] });
  readonly total = toSignal(this.cartService.total$, { initialValue: 0 });
  readonly enviando = signal(false);
  readonly erroSubmit = signal(false);
  readonly pedidoCriado = signal(false);
  readonly pedidoId = signal<number | null>(null);

  form = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postcode: '',
    address1: '',
    address2: '',
    neighborhood: '',
    city: '',
    state: '',
  };

  readonly estados = [
    'AC','AL','AM','AP','BA','CE','DF','ES','GO','MA',
    'MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN',
    'RO','RR','RS','SC','SE','SP','TO',
  ];

  onSubmit(): void {
    if (this.enviando()) return;
    this.enviando.set(true);
    this.erroSubmit.set(false);

    const lineItems = this.cartService.items.map((i) => ({
      product_id: i.productId,
      quantity: i.quantity,
    }));

    const payload = {
      billing: {
        first_name: this.form.firstName,
        last_name:  this.form.lastName,
        email:      this.form.email,
        phone:      this.form.phone,
        address_1:  this.form.address1,
        address_2:  this.form.address2,
        city:       this.form.city,
        state:      this.form.state,
        postcode:   this.form.postcode,
        country:    'BR',
      },
      line_items: lineItems,
    };

    this.woo.criarPedido(payload).subscribe({
      next: (resp: any) => {
        this.pedidoId.set(resp?.id ?? null);
        this.cartService.clearCart();
        this.pedidoCriado.set(true);
        this.enviando.set(false);
      },
      error: () => {
        this.erroSubmit.set(true);
        this.enviando.set(false);
      },
    });
  }
}
