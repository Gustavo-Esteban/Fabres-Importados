import {
  Component,
  input,
  output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { WcProduct } from '../../core/services/woo.service';

@Component({
  selector: 'app-produto-card',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <!-- Image -->
      <a [routerLink]="['/loja', produto().id]" class="card__img-link">
        <div class="card__img-wrap">
          @if (produto().images?.length) {
            <img
              [src]="produto().images[0].src"
              [alt]="produto().images[0].alt || produto().name"
              class="card__img"
              loading="lazy"
            />
          } @else {
            <div class="card__img-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="1" opacity="0.3">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          }

          @if (produto().sale_price) {
            <span class="card__badge">Sale</span>
          }

          @if (produto().stock_status === 'outofstock') {
            <div class="card__overlay">Esgotado</div>
          }
        </div>
      </a>

      <!-- Info -->
      <div class="card__body">
        @if (produto().categories?.length) {
          <span class="card__brand">{{ produto().categories[0].name }}</span>
        }
        <a [routerLink]="['/loja', produto().id]" class="card__name">
          {{ produto().name }}
        </a>

        <div class="card__price-row">
          @if (produto().sale_price) {
            <span class="card__price card__price--sale">
              R$ {{ produto().sale_price | number:'1.2-2' }}
            </span>
            <span class="card__price card__price--old">
              R$ {{ produto().regular_price | number:'1.2-2' }}
            </span>
          } @else {
            <span class="card__price">
              R$ {{ produto().price | number:'1.2-2' }}
            </span>
          }
        </div>

        <button
          class="card__btn"
          [disabled]="produto().stock_status === 'outofstock'"
          (click)="addToCart.emit(produto())"
        >
          @if (produto().stock_status === 'outofstock') {
            Esgotado
          } @else {
            Adicionar ao Carrinho
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--color-charcoal);
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-md);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: border-color var(--transition), box-shadow var(--transition);
    }

    .card:hover {
      border-color: var(--color-gold);
      box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    }

    /* Image */
    .card__img-link { display: block; }

    .card__img-wrap {
      position: relative;
      width: 100%;
      padding-top: 100%;
      background: var(--color-deep-gray);
      overflow: hidden;
    }

    .card__img {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition);
    }

    .card:hover .card__img { transform: scale(1.04); }

    .card__img-placeholder {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
    }

    .card__badge {
      position: absolute;
      top: 12px;
      left: 12px;
      background: var(--color-gold);
      color: var(--color-obsidian);
      font-family: var(--font-label);
      font-size: 0.65rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 3px 10px;
      border-radius: 2px;
    }

    .card__overlay {
      position: absolute;
      inset: 0;
      background: rgba(10,10,10,0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-label);
      font-size: 0.9rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--color-muted);
    }

    /* Body */
    .card__body {
      padding: 18px 16px 20px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .card__brand {
      font-family: var(--font-label);
      font-size: 0.68rem;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--color-gold);
    }

    .card__name {
      font-family: var(--font-display);
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-cream);
      line-height: 1.3;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      transition: color var(--transition);
    }

    .card__name:hover { color: var(--color-gold); }

    .card__price-row {
      display: flex;
      align-items: baseline;
      gap: 8px;
      margin-top: 4px;
    }

    .card__price {
      font-family: var(--font-body);
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-cream);
    }

    .card__price--sale { color: var(--color-gold); }

    .card__price--old {
      font-size: 0.8rem;
      font-weight: 400;
      color: var(--color-muted);
      text-decoration: line-through;
    }

    .card__btn {
      margin-top: auto;
      padding-top: 14px;
      background: transparent;
      border: 1px solid var(--color-deep-gray);
      color: var(--color-muted);
      font-family: var(--font-label);
      font-size: 0.75rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 10px 16px;
      border-radius: var(--radius-sm);
      transition: all var(--transition);
      cursor: pointer;
      margin-top: 12px;
    }

    .card__btn:hover:not(:disabled) {
      border-color: var(--color-gold);
      color: var(--color-gold);
      background: rgba(201,168,76,0.05);
    }

    .card__btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  `],
})
export class ProdutoCardComponent {
  readonly produto = input.required<WcProduct>();
  readonly addToCart = output<WcProduct>();
}
