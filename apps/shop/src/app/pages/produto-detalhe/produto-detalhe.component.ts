import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { WooService, WcProduct } from '../../core/services/woo.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="detalhe">
      @if (loading()) {
        <div class="detalhe__skeleton">
          <div class="sk-img"></div>
          <div class="sk-info">
            <div class="sk-line sk-line--sm"></div>
            <div class="sk-line sk-line--lg"></div>
            <div class="sk-line sk-line--md"></div>
            <div class="sk-line sk-line--sm"></div>
          </div>
        </div>
      } @else if (produto()) {
        <nav class="breadcrumb">
          <a routerLink="/">Home</a>
          <span>/</span>
          <a routerLink="/loja">Loja</a>
          @if (produto()!.categories?.length) {
            <span>/</span>
            <a [routerLink]="['/loja']"
               [queryParams]="{ categoria: produto()!.categories[0].slug }">
              {{ produto()!.categories[0].name }}
            </a>
          }
          <span>/</span>
          <span class="breadcrumb__current">{{ produto()!.name }}</span>
        </nav>

        <div class="detalhe__grid">
          <!-- Gallery -->
          <div class="detalhe__gallery">
            <div class="gallery__main">
              @if (imagemAtiva(); as img) {
                <img [src]="img.src" [alt]="img.alt || produto()!.name" class="gallery__img" />
              } @else {
                <div class="gallery__placeholder">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
                       stroke="currentColor" stroke-width="1" opacity="0.2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
              }
            </div>

            @if ((produto()!.images?.length ?? 0) > 1) {
              <div class="gallery__thumbs">
                @for (img of produto()!.images; track img.id) {
                  <button
                    class="gallery__thumb"
                    [class.gallery__thumb--active]="imagemAtiva()?.id === img.id"
                    (click)="imagemAtiva.set(img)"
                  >
                    <img [src]="img.src" [alt]="img.alt" />
                  </button>
                }
              </div>
            }
          </div>

          <!-- Info -->
          <div class="detalhe__info">
            @if (produto()!.categories?.length) {
              <a
                [routerLink]="['/loja']"
                [queryParams]="{ categoria: produto()!.categories[0].slug }"
                class="detalhe__brand"
              >
                {{ produto()!.categories[0].name }}
              </a>
            }

            <h1 class="detalhe__name">{{ produto()!.name }}</h1>

            <!-- Price -->
            <div class="detalhe__price-block">
              @if (produto()!.sale_price) {
                <span class="detalhe__price detalhe__price--sale">
                  R$ {{ produto()!.sale_price | number:'1.2-2' }}
                </span>
                <span class="detalhe__price detalhe__price--old">
                  R$ {{ produto()!.regular_price | number:'1.2-2' }}
                </span>
              } @else {
                <span class="detalhe__price">
                  R$ {{ produto()!.price | number:'1.2-2' }}
                </span>
              }
            </div>

            <!-- Stock -->
            <div class="detalhe__stock" [class.detalhe__stock--out]="produto()!.stock_status === 'outofstock'">
              @if (produto()!.stock_status === 'instock') {
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Em estoque
              } @else {
                Produto esgotado
              }
            </div>

            <!-- Short description -->
            @if (produto()!.short_description) {
              <div class="detalhe__desc"
                   [innerHTML]="produto()!.short_description">
              </div>
            }

            <!-- Quantity + Add to Cart -->
            <div class="detalhe__actions">
              <div class="qty">
                <button class="qty__btn" (click)="decQty()">−</button>
                <span class="qty__val">{{ qty() }}</span>
                <button class="qty__btn" (click)="incQty()">+</button>
              </div>

              <button
                class="detalhe__add-btn"
                [disabled]="produto()!.stock_status === 'outofstock'"
                (click)="onAddToCart()"
              >
                @if (produto()!.stock_status === 'outofstock') {
                  Esgotado
                } @else {
                  Adicionar ao Carrinho
                }
              </button>
            </div>

            <a routerLink="/carrinho" class="detalhe__cart-link">
              Ver carrinho →
            </a>

            <!-- Full description -->
            @if (produto()!.description) {
              <details class="detalhe__full-desc">
                <summary>Descrição completa</summary>
                <div [innerHTML]="produto()!.description"></div>
              </details>
            }
          </div>
        </div>
      } @else if (erro()) {
        <div class="detalhe__error">
          <p>Produto não encontrado.</p>
          <a routerLink="/loja" class="btn-outline">Voltar à Loja</a>
        </div>
      }
    </div>

    <!-- Toast -->
    @if (toastVisible()) {
      <div class="toast">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Produto adicionado ao carrinho
      </div>
    }
  `,
  styles: [`
    .detalhe {
      max-width: 1280px;
      margin: 0 auto;
      padding: 40px 24px 80px;
    }

    /* Breadcrumb */
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-label);
      font-size: 0.78rem;
      letter-spacing: 0.05em;
      color: var(--color-muted);
      margin-bottom: 40px;
      flex-wrap: wrap;
    }

    .breadcrumb a { color: var(--color-muted); transition: color var(--transition); }
    .breadcrumb a:hover { color: var(--color-gold); }
    .breadcrumb__current { color: var(--color-cream); }

    /* Grid */
    .detalhe__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: start;
    }

    /* Gallery */
    .gallery__main {
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-charcoal);
      aspect-ratio: 1;
    }

    .gallery__img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .gallery__placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
    }

    .gallery__thumbs {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      flex-wrap: wrap;
    }

    .gallery__thumb {
      width: 72px;
      height: 72px;
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--color-charcoal);
      cursor: pointer;
      padding: 0;
      transition: border-color var(--transition);
    }

    .gallery__thumb:hover,
    .gallery__thumb--active { border-color: var(--color-gold); }

    .gallery__thumb img { width: 100%; height: 100%; object-fit: cover; }

    /* Info */
    .detalhe__info {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detalhe__brand {
      font-family: var(--font-label);
      font-size: 0.75rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--color-gold);
    }

    .detalhe__name {
      font-family: var(--font-display);
      font-size: clamp(1.6rem, 2.5vw, 2.2rem);
      font-weight: 600;
      color: var(--color-cream);
      line-height: 1.2;
    }

    .detalhe__price-block {
      display: flex;
      align-items: baseline;
      gap: 12px;
    }

    .detalhe__price {
      font-size: 1.6rem;
      font-weight: 600;
      color: var(--color-cream);
    }

    .detalhe__price--sale { color: var(--color-gold); }

    .detalhe__price--old {
      font-size: 1rem;
      font-weight: 400;
      color: var(--color-muted);
      text-decoration: line-through;
    }

    .detalhe__stock {
      display: flex;
      align-items: center;
      gap: 6px;
      font-family: var(--font-label);
      font-size: 0.8rem;
      letter-spacing: 0.1em;
      color: var(--color-success, #2ecc71);
    }

    .detalhe__stock--out { color: var(--color-muted); }

    .detalhe__desc {
      font-size: 0.95rem;
      color: var(--color-muted);
      line-height: 1.7;
      border-top: 1px solid var(--color-deep-gray);
      padding-top: 16px;
    }

    .detalhe__desc p { margin-bottom: 8px; }

    /* Actions */
    .detalhe__actions {
      display: flex;
      gap: 16px;
      align-items: center;
      flex-wrap: wrap;
    }

    .qty {
      display: flex;
      align-items: center;
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .qty__btn {
      width: 40px;
      height: 44px;
      background: var(--color-charcoal);
      color: var(--color-cream);
      font-size: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background var(--transition);
      border: none;
      cursor: pointer;
    }

    .qty__btn:hover { background: var(--color-deep-gray); }

    .qty__val {
      width: 44px;
      text-align: center;
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--color-cream);
    }

    .detalhe__add-btn {
      flex: 1;
      background: var(--color-gold);
      color: var(--color-obsidian);
      font-family: var(--font-label);
      font-size: 0.85rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      padding: 14px 24px;
      border-radius: var(--radius-sm);
      border: none;
      cursor: pointer;
      transition: background var(--transition), box-shadow var(--transition);
    }

    .detalhe__add-btn:hover:not(:disabled) {
      background: var(--color-gold-light);
      box-shadow: var(--shadow-gold);
    }

    .detalhe__add-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .detalhe__cart-link {
      font-family: var(--font-label);
      font-size: 0.8rem;
      letter-spacing: 0.1em;
      color: var(--color-gold);
      transition: opacity var(--transition);
    }

    .detalhe__cart-link:hover { opacity: 0.75; }

    .detalhe__full-desc {
      border-top: 1px solid var(--color-deep-gray);
      padding-top: 16px;
      font-size: 0.9rem;
      color: var(--color-muted);
      line-height: 1.7;
    }

    .detalhe__full-desc summary {
      font-family: var(--font-label);
      font-size: 0.8rem;
      letter-spacing: 0.15em;
      text-transform: uppercase;
      color: var(--color-muted);
      cursor: pointer;
      margin-bottom: 12px;
    }

    /* Skeleton */
    .detalhe__skeleton {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
    }

    .sk-img {
      aspect-ratio: 1;
      background: var(--color-charcoal);
      border-radius: var(--radius-md);
      animation: pulse 1.5s infinite;
    }

    .sk-info { display: flex; flex-direction: column; gap: 16px; padding-top: 16px; }

    .sk-line {
      background: var(--color-charcoal);
      border-radius: 4px;
      animation: pulse 1.5s infinite;
    }

    .sk-line--sm  { height: 14px; width: 40%; }
    .sk-line--md  { height: 20px; width: 70%; }
    .sk-line--lg  { height: 40px; width: 100%; }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }

    /* Error */
    .detalhe__error {
      text-align: center;
      padding: 80px 0;
      color: var(--color-muted);
      font-family: var(--font-label);
      font-size: 1rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: var(--color-charcoal);
      border: 1px solid var(--color-gold);
      color: var(--color-cream);
      font-family: var(--font-label);
      font-size: 0.85rem;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: var(--shadow-card);
      z-index: 200;
      animation: slideIn 0.3s ease;
    }

    .toast svg { color: var(--color-gold); }

    @keyframes slideIn {
      from { transform: translateY(16px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    @media (max-width: 900px) {
      .detalhe__grid,
      .detalhe__skeleton { grid-template-columns: 1fr; gap: 32px; }
    }
  `],
})
export class ProdutoDetalheComponent implements OnInit {
  private readonly woo = inject(WooService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly produto = signal<WcProduct | null>(null);
  readonly loading = signal(true);
  readonly erro = signal(false);
  readonly imagemAtiva = signal<WcProduct['images'][0] | null>(null);
  readonly qty = signal(1);
  readonly toastVisible = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.woo.getProduto(id).subscribe({
      next: (p) => {
        this.produto.set(p);
        this.imagemAtiva.set(p.images?.[0] ?? null);
        this.loading.set(false);
      },
      error: () => {
        this.erro.set(true);
        this.loading.set(false);
      },
    });
  }

  incQty(): void { this.qty.update((q) => q + 1); }
  decQty(): void { this.qty.update((q) => Math.max(1, q - 1)); }

  onAddToCart(): void {
    const p = this.produto();
    if (!p) return;
    for (let i = 0; i < this.qty(); i++) {
      this.cart.addItem({
        productId: p.id,
        name: p.name,
        price: parseFloat(p.price || '0'),
        imageUrl: p.images?.[0]?.src ?? '',
      });
    }
    this.showToast();
  }

  private showToast(): void {
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2500);
  }
}
