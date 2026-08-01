import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/inicio.component'), title: 'MA. BERTOMEU — Aderezos falleros' },
  { path: 'catalogo', loadComponent: () => import('./pages/catalogo.component'), title: 'Catálogo — MA. BERTOMEU' },
  { path: 'producto/:slug', loadComponent: () => import('./pages/producto.component'), title: 'MA. BERTOMEU' },
  { path: 'como-comprar', loadComponent: () => import('./pages/como-comprar.component'), title: 'Cómo comprar — MA. BERTOMEU' },
  { path: 'carrito', loadComponent: () => import('./pages/carrito.component'), title: 'Carrito — MA. BERTOMEU' },
  { path: 'pedido/ko', loadComponent: () => import('./pages/pedido-resultado.component'), data: { ok: false }, title: 'Pago no completado' },
  { path: '**', redirectTo: '' }
];