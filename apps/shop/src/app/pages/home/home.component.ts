import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { WooService, WcProduct } from '../../core/services/woo.service';
import { CartService } from '../../core/services/cart.service';
import { BrandCarouselComponent } from '../../shared/brand-carousel/brand-carousel.component';
import { ProdutoCardComponent } from '../../shared/produto-card/produto-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, BrandCarouselComponent, ProdutoCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="hero__content">
        <p class="hero__eyebrow">Coleção Exclusiva</p>
        <h1 class="hero__title">A Arte das<br><em>Fragrâncias de Luxo</em></h1>
        <p class="hero__subtitle">
          Descubra os perfumes mais icônicos do mundo.
          Curadoria exclusiva das maiores maisons de parfum.
        </p>
        <div class="hero__actions">
          <a routerLink="/loja" class="btn-gold">Explorar Coleção</a>
          <a routerLink="/sobre" class="btn-outline">Nossa História</a>
        </div>
      </div>
      <div class="hero__overlay"></div>
    </section>

    <!-- Brand Carousel -->
    <app-brand-carousel />

    <!-- Featured Products -->
    <section class="featured">
      <div class="featured__header">
        <p class="section-subtitle">Seleção Especial</p>
        <h2 class="section-title">Produtos em Destaque</h2>
        <div class="gold-divider"></div>
      </div>

      @if (loading()) {
        <div class="featured__skeleton">
          @for (_ of [1,2,3,4,5,6]; track $index) {
            <div class="skeleton-card"></div>
          }
        </div>
      } @else if (produtos().length) {
        <div class="featured__grid">
          @for (p of produtos(); track p.id) {
            <app-produto-card
              [produto]="p"
              (addToCart)="onAddToCart($event)"
            />
          }
        </div>
        <div class="featured__cta">
          <a routerLink="/loja" class="btn-outline">Ver Toda a Coleção</a>
        </div>
      } @else {
        <p class="featured__empty">Nenhum produto disponível no momento.</p>
      }
    </section>

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
    /* Hero */
    .hero {
      position: relative;
      min-height: 90vh;
      display: flex;
      align-items: center;
      background:
        linear-gradient(135deg, rgba(255,255,255,0.94) 45%, rgba(255,255,255,0.55) 100%),
        url('https://images.unsplash.com/photo-1541643600914-78b084683702?w=1600&q=80')
        center/cover no-repeat;
    }

    .hero__content {
      position: relative;
      z-index: 2;
      padding: 80px 24px;
      max-width: 580px;
      margin-left: clamp(24px, 8vw, 160px);
    }

    .hero__eyebrow {
      font-family: var(--font-body);
      font-size: 0.75rem;
      letter-spacing: 0.35em;
      text-transform: uppercase;
      color: var(--color-muted);
      margin-bottom: 16px;
    }

    .hero__title {
      font-family: var(--font-display);
      font-size: clamp(2.4rem, 5vw, 4rem);
      font-weight: 400;
      line-height: 1.1;
      color: var(--color-black);
      margin-bottom: 20px;
    }

    .hero__title em {
      font-style: italic;
      color: var(--color-black);
    }

    .hero__subtitle {
      font-family: var(--font-body);
      font-size: 1rem;
      color: var(--color-mid);
      line-height: 1.7;
      margin-bottom: 36px;
      max-width: 420px;
    }

    .hero__actions {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }

    /* Featured */
    .featured {
      padding: 80px 24px;
      max-width: 1280px;
      margin: 0 auto;
    }

    .featured__header {
      text-align: center;
      margin-bottom: 48px;
    }

    .featured__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .featured__skeleton {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .skeleton-card {
      height: 400px;
      background: var(--color-charcoal);
      border-radius: var(--radius-md);
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }

    .featured__cta {
      text-align: center;
      margin-top: 48px;
    }

    .featured__empty {
      text-align: center;
      color: var(--color-muted);
      font-family: var(--font-label);
      font-size: 1rem;
      letter-spacing: 0.1em;
      padding: 48px 0;
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 32px;
      right: 32px;
      background: var(--color-black);
      color: var(--color-white);
      font-family: var(--font-body);
      font-size: 0.85rem;
      letter-spacing: 0.03em;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
      z-index: 200;
      animation: slideIn 0.3s ease;
    }

    .toast svg { color: var(--color-white); }

    @keyframes slideIn {
      from { transform: translateY(16px); opacity: 0; }
      to   { transform: translateY(0);    opacity: 1; }
    }

    @media (max-width: 1024px) {
      .featured__grid,
      .featured__skeleton { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 600px) {
      .hero { min-height: 80vh; }
      .featured__grid,
      .featured__skeleton { grid-template-columns: 1fr; }
      .hero__content { margin-left: 24px; }
    }
  `],
})
export class HomeComponent implements OnInit {
  private readonly woo = inject(WooService);
  private readonly cart = inject(CartService);

  readonly produtos = signal<WcProduct[]>([]);
  readonly loading = signal(true);
  readonly toastVisible = signal(false);

  ngOnInit(): void {
    this.woo.getProdutos({ per_page: 6 }).subscribe({
      next: (data) => {
        this.produtos.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  onAddToCart(produto: WcProduct): void {
    this.cart.addItem({
      productId: produto.id,
      name: produto.name,
      price: parseFloat(produto.price || '0'),
      imageUrl: produto.images?.[0]?.src ?? '',
    });
    this.showToast();
  }

  private showToast(): void {
    this.toastVisible.set(true);
    setTimeout(() => this.toastVisible.set(false), 2500);
  }
}
