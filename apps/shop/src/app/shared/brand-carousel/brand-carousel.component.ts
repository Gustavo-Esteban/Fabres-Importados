import {
  Component,
  ChangeDetectionStrategy,
  signal,
  computed,
  inject,
  PLATFORM_ID,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Brand {
  slug: string;
  name: string;
  label: string;
}

/*
 * Infinite-loop carousel — CSS Grid approach
 * ──────────────────────────────────────────
 * VISIBLE = 5 brands at a time.
 * extended = brands × 3  (30 items total, indices 0–29).
 *
 * .carousel__track   →  width: 100% of viewport, display: grid,
 *                        grid-template-columns: repeat(30, calc(100% / 5))
 *                        Each column = viewport/5.  30 cols overflow the
 *                        100%-wide track; viewport clips them.
 *
 * translateX formula:  translateX(calc(-offset * (100% / 5)))
 *   100% = track width = viewport width
 *   At offset 10: translateX(-200%) = shift left by 2×viewport
 *                 → shows extended[10..14] = brands[0..4] ✓
 *
 * Infinite loop:
 *   Middle copy: offsets 10–19  (real positions, brands[0..9])
 *   Left guard:  offsets  0– 9  (mirror of right end)
 *   Right guard: offsets 20–29  (mirror of left start)
 *   onTransitionEnd:
 *     offset >= 20  → jump to offset-10 (no anim, same visual)
 *     offset <  10  → jump to offset+10 (no anim, same visual)
 */

const VISIBLE = 5;

@Component({
  selector: 'app-brand-carousel',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="carousel"
             (mouseenter)="pauseTimer()"
             (mouseleave)="resumeTimer()">

      <p class="carousel__eyebrow">Explorar por Marca</p>
      <h2 class="carousel__title">Nossas Marcas</h2>
      <div class="carousel__divider"></div>

      <div class="carousel__row">

        <!-- Left arrow -->
        <button class="carousel__arrow" (click)="prev()" aria-label="Marca anterior">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>

        <!-- Viewport: overflow:hidden window into the sliding grid -->
        <div class="carousel__viewport">
          <div
            class="carousel__track"
            [style.transform]="trackTransform()"
            [style.transition]="animating()
              ? 'transform 0.55s cubic-bezier(0.25,0.1,0.25,1)'
              : 'none'"
            (transitionend)="onTransitionEnd()"
          >
            @for (brand of extended; track $index) {
              <a
                class="carousel__item"
                [routerLink]="['/loja']"
                [queryParams]="{ categoria: brand.slug }"
                [attr.aria-label]="'Ver perfumes ' + brand.name"
              >
                <div class="carousel__box">
                  <svg class="carousel__svg" viewBox="0 0 140 46"
                       xmlns="http://www.w3.org/2000/svg">
                    <text
                      x="70" y="29"
                      text-anchor="middle"
                      font-family="'DM Sans','Helvetica Neue',sans-serif"
                      font-size="15"
                      font-weight="600"
                      letter-spacing="3"
                      fill="currentColor"
                    >{{ brand.label }}</text>
                  </svg>
                </div>
                <span class="carousel__name">{{ brand.name }}</span>
              </a>
            }
          </div>
        </div>

        <!-- Right arrow -->
        <button class="carousel__arrow" (click)="next()" aria-label="Próxima marca">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>

      </div>
    </section>
  `,
  styles: [`
    /* ── Section wrapper ─────────────────────────────── */
    .carousel {
      padding: 60px 0;
      background: var(--color-bg-alt);
      text-align: center;
    }

    .carousel__eyebrow {
      font-family: var(--font-body);
      font-size: 0.72rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--color-muted);
      margin-bottom: 8px;
    }

    .carousel__title {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 2.5vw, 2rem);
      font-weight: 400;
      color: var(--color-black);
      margin-bottom: 12px;
    }

    .carousel__divider {
      width: 40px;
      height: 2px;
      background: var(--color-black);
      margin: 0 auto 36px;
      border-radius: 2px;
    }

    /* ── [ ← ]  [   viewport   ]  [ → ] ─────────────── */
    .carousel__row {
      display: flex;
      align-items: center;
      gap: 16px;
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 32px;
    }

    /* Arrow buttons */
    .carousel__arrow {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--color-white);
      border: 1.5px solid var(--color-border-dark);
      color: var(--color-mid);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition:
        background var(--transition),
        color var(--transition),
        border-color var(--transition),
        box-shadow var(--transition);
    }

    .carousel__arrow:hover {
      background: var(--color-black);
      color: var(--color-white);
      border-color: var(--color-black);
      box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    }

    /* ── Viewport: clipping window ───────────────────── */
    .carousel__viewport {
      flex: 1;
      min-width: 0;     /* allow flex shrink */
      overflow: hidden;
    }

    /*
     * Track: CSS Grid with 30 columns, each 1/5 of the track's own width.
     * track width = 100% of viewport (its flex parent).
     * Each column = calc(100% / 5) = viewport/5.
     * 30 columns × viewport/5 = 6× viewport  →  overflow clipped by viewport.
     *
     * transform formula:
     *   translateX(calc(-offset * (100% / 5)))
     *   100% = track width = viewport
     *   At offset=10: translateX(-200%) = -2×viewport → shows cols 10-14 ✓
     */
    .carousel__track {
      display: grid;
      width: 100%;
      grid-template-columns: repeat(30, calc(100% / 5));
      align-items: start;
      will-change: transform;
    }

    /* ── Each brand tile ─────────────────────────────── */
    .carousel__item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      text-decoration: none;
      cursor: pointer;
    }

    .carousel__box {
      width: 100%;
      aspect-ratio: 3 / 1;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--color-border-dark);
      border-radius: var(--radius-sm);
      background: var(--color-white);
      color: var(--color-mid);
      overflow: hidden;
      transition:
        background var(--transition),
        border-color var(--transition),
        color var(--transition),
        box-shadow var(--transition);
    }

    .carousel__item:hover .carousel__box {
      background: var(--color-black);
      border-color: var(--color-black);
      color: var(--color-white);
      box-shadow: 0 4px 20px rgba(0,0,0,0.18);
    }

    .carousel__svg {
      width: 78%;
      height: auto;
    }

    .carousel__name {
      font-family: var(--font-body);
      font-size: 0.64rem;
      letter-spacing: 0.22em;
      text-transform: uppercase;
      color: var(--color-muted);
      transition: color var(--transition);
    }

    .carousel__item:hover .carousel__name {
      color: var(--color-black);
    }

    /* ── Mobile: natural touch scroll, no arrows ─────── */
    @media (max-width: 768px) {
      .carousel__arrow { display: none; }

      .carousel__viewport {
        overflow-x: auto;
        scrollbar-width: none;
        -ms-overflow-style: none;
      }
      .carousel__viewport::-webkit-scrollbar { display: none; }

      /* Override JS transform — plain scrollable row on mobile */
      .carousel__track {
        transform: none !important;
        transition: none !important;
        display: flex;
        width: auto;
        gap: 12px;
        padding: 4px 0;
      }

      .carousel__item {
        flex: 0 0 100px;
        padding: 4px 0;
      }

      .carousel__box {
        width: 100px;
        height: 48px;
        aspect-ratio: unset;
      }
    }
  `],
})
export class BrandCarouselComponent implements OnInit, OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);

  readonly brands: Brand[] = [
    { slug: 'prada',      name: 'Prada',      label: 'PRADA'     },
    { slug: 'ysl',        name: 'YSL',        label: 'YSL'       },
    { slug: 'dior',       name: 'Dior',       label: 'DIOR'      },
    { slug: 'chanel',     name: 'Chanel',     label: 'CHANEL'    },
    { slug: 'gucci',      name: 'Gucci',      label: 'GUCCI'     },
    { slug: 'valentino',  name: 'Valentino',  label: 'VALENTINO' },
    { slug: 'givenchy',   name: 'Givenchy',   label: 'GIVENCHY'  },
    { slug: 'burberry',   name: 'Burberry',   label: 'BURBERRY'  },
    { slug: 'lancome',    name: 'Lancôme',    label: 'LANCÔME'   },
    { slug: 'versace',    name: 'Versace',    label: 'VERSACE'   },
  ];

  /** Triple the brands for a seamless infinite loop (left guard | middle | right guard). */
  readonly extended = [...this.brands, ...this.brands, ...this.brands];

  /** Index of the first visible item. Starts in the middle copy. */
  readonly offset   = signal(this.brands.length); // = 10
  readonly animating = signal(true);

  /**
   * translateX formula (track width = viewport width):
   *   translateX(calc(-offset * (100% / VISIBLE)))
   * where VISIBLE = 5, so each step = 20% of the viewport.
   */
  readonly trackTransform = computed(
    () => `translateX(calc(-${this.offset()} * (100% / ${VISIBLE})))`
  );

  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) this.startTimer();
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  next(): void {
    this.animating.set(true);
    this.offset.update(o => o + 1);
    this.startTimer(); // reset 3 s countdown on manual click
  }

  prev(): void {
    this.animating.set(true);
    this.offset.update(o => o - 1);
    this.startTimer();
  }

  /** After each CSS transition, silently reset to the equivalent middle-copy position. */
  onTransitionEnd(): void {
    const n = this.brands.length; // 10
    const o = this.offset();
    if (o >= 2 * n) {
      // Entered right guard → jump to same position in middle copy
      this.animating.set(false);
      this.offset.set(o - n);
    } else if (o < n) {
      // Entered left guard → jump to same position in middle copy
      this.animating.set(false);
      this.offset.set(o + n);
    }
  }

  pauseTimer():  void { this.stopTimer(); }
  resumeTimer(): void {
    if (isPlatformBrowser(this.platformId)) this.startTimer();
  }

  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(() => {
      this.animating.set(true);
      this.offset.update(o => o + 1);
    }, 2000);
  }

  private stopTimer(): void {
    if (this.timer) { clearInterval(this.timer); this.timer = undefined; }
  }
}
