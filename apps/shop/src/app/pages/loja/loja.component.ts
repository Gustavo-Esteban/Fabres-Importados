import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { WooService, WcProduct } from '../../core/services/woo.service';
import { CartService } from '../../core/services/cart.service';
import { ProdutoCardComponent } from '../../shared/produto-card/produto-card.component';

@Component({
  selector: 'app-loja',
  standalone: true,
  imports: [RouterLink, FormsModule, ProdutoCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="loja">
      <!-- Page header -->
      <div class="loja__hero">
        <p class="section-subtitle">Nossa Coleção</p>
        <h1 class="loja__title">
          @if (categoriaAtiva()) {
            {{ labelMarca() }}
          } @else {
            Todos os Perfumes
          }
        </h1>
        <div class="gold-divider"></div>
      </div>

      <div class="loja__layout">
        <!-- Sidebar filtro -->
        <aside class="loja__sidebar">
          <div class="sidebar__search">
            <h3 class="sidebar__title">Buscar</h3>
            <input
              type="text"
              [(ngModel)]="buscaTexto"
              (ngModelChange)="onBusca()"
              placeholder="Nome do perfume..."
              class="sidebar__input"
            />
          </div>

          <h3 class="sidebar__title">Filtrar por Marca</h3>
          <ul class="sidebar__list">
            <li>
              <a routerLink="/loja"
                 class="sidebar__item"
                 [class.sidebar__item--active]="!categoriaAtiva()">
                Todas as Marcas
              </a>
            </li>
            @for (m of marcas; track m.slug) {
              <li>
                <a [routerLink]="['/loja']"
                   [queryParams]="{ categoria: m.slug }"
                   class="sidebar__item"
                   [class.sidebar__item--active]="categoriaAtiva() === m.slug">
                  {{ m.nome }}
                </a>
              </li>
            }
          </ul>
        </aside>

        <!-- Products -->
        <div class="loja__main">
          @if (loading()) {
            <div class="loja__grid">
              @for (_ of [1,2,3,4,5,6]; track $index) {
                <div class="skeleton-card"></div>
              }
            </div>
          } @else if (produtos().length) {
            <div class="loja__info">
              {{ produtos().length }} produto{{ produtos().length !== 1 ? 's' : '' }} encontrado{{ produtos().length !== 1 ? 's' : '' }}
            </div>
            <div class="loja__grid">
              @for (p of produtos(); track p.id) {
                <app-produto-card
                  [produto]="p"
                  (addToCart)="onAddToCart($event)"
                />
              }
            </div>
          } @else {
            <div class="loja__empty">
              <p>Nenhum produto encontrado.</p>
              <a routerLink="/loja" class="btn-outline" style="margin-top:16px">
                Ver todos
              </a>
            </div>
          }
        </div>
      </div>
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
    .loja {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 24px 80px;
    }

    .loja__hero {
      text-align: center;
      padding: 60px 0 40px;
    }

    .loja__title {
      font-family: var(--font-display);
      font-size: clamp(1.8rem, 3.5vw, 2.8rem);
      font-weight: 400;
      color: var(--color-black);
    }

    .loja__layout {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 40px;
      align-items: start;
    }

    /* Sidebar */
    .loja__sidebar {
      position: sticky;
      top: 90px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .sidebar__title {
      font-family: var(--font-body);
      font-size: 0.68rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--color-muted);
      margin-bottom: 14px;
    }

    .sidebar__list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .sidebar__item {
      display: block;
      padding: 8px 12px;
      font-family: var(--font-body);
      font-size: 0.88rem;
      letter-spacing: 0.03em;
      color: var(--color-mid);
      border-radius: var(--radius-sm);
      transition: color var(--transition), background var(--transition);
      border-left: 2px solid transparent;
    }

    .sidebar__item:hover {
      color: var(--color-black);
      background: var(--color-bg-alt);
    }

    .sidebar__item--active {
      color: var(--color-black);
      border-left-color: var(--color-black);
      background: rgba(0,0,0,0.04);
    }

    .sidebar__input {
      width: 100%;
      padding: 10px 14px;
      background: var(--color-white);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      color: var(--color-black);
      font-family: var(--font-body);
      font-size: 0.9rem;
      transition: border-color var(--transition);
      outline: none;
    }

    .sidebar__input:focus {
      border-color: var(--color-black);
    }

    .sidebar__input::placeholder {
      color: var(--color-muted);
    }

    /* Main grid - 3 colunas */
    .loja__main { min-height: 400px; }

    .loja__info {
      font-family: var(--font-label);
      font-size: 0.8rem;
      letter-spacing: 0.1em;
      color: var(--color-muted);
      margin-bottom: 20px;
    }

    .loja__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }

    .skeleton-card {
      height: 420px;
      background: var(--color-charcoal);
      border-radius: var(--radius-md);
      animation: pulse 1.5s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50%       { opacity: 1; }
    }

    .loja__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 80px 0;
      color: var(--color-muted);
      font-family: var(--font-label);
      font-size: 1rem;
      letter-spacing: 0.1em;
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
      .loja__grid { grid-template-columns: repeat(2, 1fr); }
    }

    @media (max-width: 768px) {
      .loja__layout { grid-template-columns: 1fr; }
      .loja__sidebar { position: static; }
      .sidebar__list { flex-direction: row; flex-wrap: wrap; gap: 8px; }
      .sidebar__item { border-left: none; border-bottom: 2px solid transparent; }
      .sidebar__item--active { border-left-color: transparent; border-bottom-color: var(--color-black); }
    }

    @media (max-width: 600px) {
      .loja__grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
    }
  `],
})
export class LojaComponent implements OnInit {
  private readonly woo = inject(WooService);
  private readonly cart = inject(CartService);
  private readonly route = inject(ActivatedRoute);

  readonly produtos = signal<WcProduct[]>([]);
  readonly loading = signal(true);
  readonly categoriaAtiva = signal<string | null>(null);
  readonly toastVisible = signal(false);
  buscaTexto = '';
  private buscaTimer: ReturnType<typeof setTimeout> | null = null;

  readonly marcas = [
    { slug: 'prada',     nome: 'Prada'     },
    { slug: 'ysl',       nome: 'YSL'       },
    { slug: 'dior',      nome: 'Dior'      },
    { slug: 'chanel',    nome: 'Chanel'    },
    { slug: 'gucci',     nome: 'Gucci'     },
    { slug: 'valentino', nome: 'Valentino' },
    { slug: 'givenchy',  nome: 'Givenchy'  },
    { slug: 'burberry',  nome: 'Burberry'  },
    { slug: 'lancome',   nome: 'Lancôme'   },
    { slug: 'versace',   nome: 'Versace'   },
  ];

  readonly labelsMarca: Record<string, string> = Object.fromEntries(
    this.marcas.map((m) => [m.slug, m.nome]),
  );

  labelMarca(): string {
    const slug = this.categoriaAtiva();
    return slug ? (this.labelsMarca[slug] ?? slug) : 'Todos os Perfumes';
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const cat = params.get('categoria');
      this.categoriaAtiva.set(cat);
      this.carregarProdutos(cat);
    });
  }

  onBusca(): void {
    if (this.buscaTimer) clearTimeout(this.buscaTimer);
    this.buscaTimer = setTimeout(() => {
      this.carregarProdutos(this.categoriaAtiva(), this.buscaTexto || undefined);
    }, 400);
  }

  private carregarProdutos(categoria?: string | null, busca?: string): void {
    this.loading.set(true);
    this.woo
      .getProdutos({
        categoria: categoria ?? undefined,
        busca,
        per_page: 12,
      })
      .subscribe({
        next: (data) => { this.produtos.set(data); this.loading.set(false); },
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
