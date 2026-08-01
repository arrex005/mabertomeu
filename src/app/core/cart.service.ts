import { Injectable, computed, effect, signal } from '@angular/core';
import { Producto } from './core';

export interface LineaCarrito {
  producto_id: number; nombre: string; slug: string;
  precio_cents: number; imagen?: string | null; cantidad: number; stock: number;
}

const CLAVE = 'mb_carrito';

@Injectable({ providedIn: 'root' })
export class CartService {
  lineas = signal<LineaCarrito[]>(JSON.parse(localStorage.getItem(CLAVE) ?? '[]'));

  totalArticulos = computed(() => this.lineas().reduce((s, l) => s + l.cantidad, 0));
  totalCents = computed(() => this.lineas().reduce((s, l) => s + l.precio_cents * l.cantidad, 0));

  constructor() {
    effect(() => localStorage.setItem(CLAVE, JSON.stringify(this.lineas())));
  }

  agregar(p: Producto, cantidad = 1) {
    this.lineas.update(ls => {
      const existente = ls.find(l => l.producto_id === p.id);
      if (existente) {
        return ls.map(l => l.producto_id === p.id
          ? { ...l, cantidad: Math.min(l.cantidad + cantidad, l.stock) } : l);
      }
      return [...ls, {
        producto_id: p.id, nombre: p.nombre, slug: p.slug,
        precio_cents: p.precio_cents, imagen: p.imagen ?? p.imagenes?.[0], cantidad, stock: p.stock
      }];
    });
  }
  cambiarCantidad(id: number, cantidad: number) {
    this.lineas.update(ls => cantidad <= 0
      ? ls.filter(l => l.producto_id !== id)
      : ls.map(l => l.producto_id === id ? { ...l, cantidad: Math.min(cantidad, l.stock) } : l));
  }
  quitar(id: number) { this.lineas.update(ls => ls.filter(l => l.producto_id !== id)); }
  vaciar() { this.lineas.set([]); }
}