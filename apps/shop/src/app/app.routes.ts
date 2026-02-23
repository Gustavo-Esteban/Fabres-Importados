import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'loja',
    loadComponent: () =>
      import('./pages/loja/loja.component').then((m) => m.LojaComponent),
  },
  {
    path: 'loja/:id',
    loadComponent: () =>
      import('./pages/produto-detalhe/produto-detalhe.component').then(
        (m) => m.ProdutoDetalheComponent,
      ),
  },
  {
    path: 'sobre',
    loadComponent: () =>
      import('./pages/sobre/sobre.component').then((m) => m.SobreComponent),
  },
  {
    path: 'carrinho',
    loadComponent: () =>
      import('./pages/carrinho/carrinho.component').then(
        (m) => m.CarrinhoComponent,
      ),
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./pages/checkout/checkout.component').then(
        (m) => m.CheckoutComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
