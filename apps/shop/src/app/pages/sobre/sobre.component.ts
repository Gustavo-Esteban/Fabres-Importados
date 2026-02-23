import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-sobre',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="sobre">
      <!-- Hero -->
      <section class="sobre__hero">
        <p class="section-subtitle">Nossa Essência</p>
        <h1 class="sobre__title">Sobre a<br><em>Fabre's Importados</em></h1>
        <div class="gold-divider"></div>
      </section>

      <!-- Story -->
      <section class="sobre__story container">
        <div class="story__grid">
          <div class="story__img-wrap">
            <div class="story__img-placeholder">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" stroke-width="0.8" opacity="0.15">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
          </div>

          <div class="story__text">
            <p class="story__eyebrow">Nossa História</p>
            <h2 class="story__heading">Uma paixão por<br>fragrâncias de luxo</h2>
            <p>
              A Fabre's Importados nasceu da paixão pelas grandes criações da
              parfumerie mundial. Trazemos ao Brasil os perfumes mais icônicos e
              exclusivos das principais maisons de luxo da Europa, com autenticidade
              garantida e entrega cuidadosa.
            </p>
            <p>
              Acreditamos que uma fragrância não é apenas um acessório — é uma extensão
              da sua identidade, um cartão de visitas invisível que permanece na
              memória de quem você encontra.
            </p>
            <p>
              Nossa curadoria rigorosa seleciona apenas peças que representam o
              ápice da criação olfativa, desde os clássicos atemporais até as
              novidades mais exclusivas das coleções de cada temporada.
            </p>
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="valores">
        <div class="valores__container">
          <div class="valores__header">
            <p class="section-subtitle">O que nos guia</p>
            <h2 class="section-title">Nossos Valores</h2>
            <div class="gold-divider"></div>
          </div>

          <div class="valores__grid">
            <div class="valor">
              <div class="valor__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 class="valor__title">Autenticidade</h3>
              <p class="valor__text">
                Todos os nossos produtos são 100% originais, importados
                diretamente dos distribuidores oficiais.
              </p>
            </div>

            <div class="valor">
              <div class="valor__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
              <h3 class="valor__title">Exclusividade</h3>
              <p class="valor__text">
                Curadoria rigorosa dos perfumes mais desejados e difíceis
                de encontrar no mercado brasileiro.
              </p>
            </div>

            <div class="valor">
              <div class="valor__icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="1.5">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h3 class="valor__title">Experiência</h3>
              <p class="valor__text">
                Atendimento personalizado para ajudá-lo a encontrar a
                fragrância perfeita para cada momento e ocasião.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA -->
      <section class="sobre__cta">
        <h2 class="sobre__cta-title">Pronto para descobrir<br>sua nova fragrância?</h2>
        <a routerLink="/loja" class="btn-gold">Explorar Coleção</a>
      </section>
    </div>
  `,
  styles: [`
    .sobre { padding-bottom: 0; }

    /* Hero */
    .sobre__hero {
      text-align: center;
      padding: 80px 24px 60px;
    }

    .sobre__title {
      font-family: var(--font-display);
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 600;
      color: var(--color-cream);
      line-height: 1.2;
    }

    .sobre__title em {
      font-style: italic;
      color: var(--color-gold);
    }

    /* Story */
    .sobre__story { padding: 0 24px 80px; }

    .story__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }

    .story__img-wrap {
      aspect-ratio: 4/5;
      background: var(--color-charcoal);
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted);
    }

    .story__text { display: flex; flex-direction: column; gap: 16px; }

    .story__eyebrow {
      font-family: var(--font-label);
      font-size: 0.72rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      color: var(--color-gold);
    }

    .story__heading {
      font-family: var(--font-display);
      font-size: clamp(1.4rem, 2.5vw, 2rem);
      font-weight: 600;
      color: var(--color-cream);
      line-height: 1.25;
    }

    .story__text p {
      font-size: 0.95rem;
      color: var(--color-muted);
      line-height: 1.8;
    }

    /* Values */
    .valores {
      background: var(--color-charcoal);
      padding: 80px 24px;
      border-top: 1px solid var(--color-deep-gray);
      border-bottom: 1px solid var(--color-deep-gray);
    }

    .valores__container { max-width: 1280px; margin: 0 auto; }

    .valores__header { text-align: center; margin-bottom: 48px; }

    .valores__grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 32px;
    }

    .valor {
      text-align: center;
      padding: 32px 24px;
      border: 1px solid var(--color-deep-gray);
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      transition: border-color var(--transition);
    }

    .valor:hover { border-color: var(--color-gold); }

    .valor__icon {
      color: var(--color-gold);
      width: 56px;
      height: 56px;
      border: 1px solid var(--color-deep-gray);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .valor__title {
      font-family: var(--font-display);
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--color-cream);
    }

    .valor__text {
      font-size: 0.9rem;
      color: var(--color-muted);
      line-height: 1.7;
    }

    /* CTA */
    .sobre__cta {
      text-align: center;
      padding: 80px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 32px;
    }

    .sobre__cta-title {
      font-family: var(--font-display);
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      font-weight: 600;
      color: var(--color-cream);
      line-height: 1.3;
    }

    @media (max-width: 900px) {
      .story__grid    { grid-template-columns: 1fr; }
      .story__img-wrap { max-height: 300px; }
      .valores__grid  { grid-template-columns: 1fr; gap: 16px; }
    }

    @media (max-width: 600px) {
      .valores__grid { grid-template-columns: 1fr; }
    }
  `],
})
export class SobreComponent {}
