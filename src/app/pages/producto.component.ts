import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService } from '../core/api.service';
import { CartService } from '../core/cart.service';
import { Producto, eur } from '../core/core';

@Component({
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (producto(); as p) {
      <div class="contenedor pagina">
        <nav class="miga"><a routerLink="/catalogo">Catálogo</a> / {{ p.categoria }}</nav>

        <div class="ficha">
          <div class="galeria">
            <div class="marco-grande">
              @if (imagenActiva()) { <img [src]="imagenActiva()" [alt]="p.nombre"> }
              @else { <span class="sin-foto grande">MB</span> }
            </div>
            @if ((p.imagenes?.length ?? 0) > 1) {
              <div class="miniaturas">
                @for (img of p.imagenes; track img) {
                  <button (click)="imagenActiva.set(img)" [class.activa]="imagenActiva() === img"
                          [attr.aria-label]="'Ver imagen de ' + p.nombre">
                    <img [src]="img" alt="">
                  </button>
                }
              </div>
            }
          </div>

          <div class="datos">
            <h1>{{ p.nombre }}</h1>
            <p class="precio-grande">{{ eur(p.precio_cents) }}</p>
            @if (p.descripcion) { <p class="descripcion">{{ p.descripcion }}</p> }

            <dl class="detalles">
              @if (p.materiales?.length) {
                <dt>Material</dt><dd>{{ p.materiales!.join(', ') }}</dd>
              }
              @if (p.piedras?.length) {
                <dt>Piedras</dt><dd>{{ p.piedras!.join(', ') }}</dd>
              }
              <dt>Disponibilidad</dt>
              <dd>{{ p.stock > 0 ? 'En stock' : 'Agotado — consúltanos para encargo' }}</dd>
            </dl>

            <button class="btn" [disabled]="p.stock === 0" (click)="agregar(p)">
              {{ agregado() ? 'Añadido ✓' : 'Añadir al carrito' }}
            </button>

            @if (p.stock === 0) {
              <p class="nota">Podemos fabricarla por encargo. Escríbenos desde el formulario de contacto.</p>
            }
          </div>
        </div>
      </div>
    } @else if (noEncontrado()) {
      <div class="contenedor pagina centro">
        <h1>Pieza no encontrada</h1>
        <p class="suave">Puede que ya no esté disponible. <a routerLink="/catalogo" class="oro">Vuelve al catálogo</a>.</p>
      </div>
    } @else {
      <div class="contenedor pagina">
        <p class="estado-vacio">Cargando pieza…</p>
      </div>
    }
  `,
  styles: [`
    .miga { font-size: 0.85rem; color: var(--tinta-suave); margin-bottom: 1.5rem; }
    .miga a:hover { color: var(--oro-oscuro); }
    .ficha { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
    .marco-grande {
      aspect-ratio: 1; border: 1px solid var(--linea); border-radius: var(--radio);
      background: var(--superficie); display: grid; place-items: center; overflow: hidden;
    }
    .marco-grande img { width: 100%; height: 100%; object-fit: cover; }
    .sin-foto.grande { font-size: 4rem; }
    .miniaturas { display: flex; gap: 0.5rem; margin-top: 0.75rem; }
    .miniaturas button {
      width: 64px; height: 64px; padding: 0;
      border: 1px solid var(--linea); background: none; overflow: hidden;
    }
    .miniaturas button.activa { border-color: var(--oro); }
    .miniaturas img { width: 100%; height: 100%; object-fit: cover; }
    .precio-grande { font-size: 1.5rem; color: var(--oro-oscuro); margin: 0.25rem 0 1rem; }
    .descripcion { color: var(--tinta-suave); }
    .detalles { margin: 1.5rem 0 2rem; }
    .detalles dt {
      font-size: 0.78rem; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--tinta-suave);
    }
    .detalles dd { margin: 0.1rem 0 0.9rem; }
    .nota { color: var(--tinta-suave); font-size: 0.9rem; margin-top: 1rem; }
    @media (max-width: 760px) { .ficha { grid-template-columns: 1fr; gap: 1.5rem; } }
  `]
})
export default class ProductoComponent {
  private api = inject(ApiService);
  private carrito = inject(CartService);
  eur = eur;

  producto = signal<Producto | null>(null);
  imagenActiva = signal<string | null>(null);
  noEncontrado = signal(false);
  agregado = signal(false);

  constructor(ruta: ActivatedRoute) {
    ruta.paramMap.subscribe(pm => {
      const slug = pm.get('slug')!;
      this.api.producto(slug).subscribe({
        next: p => { this.producto.set(p); this.imagenActiva.set(p.imagenes?.[0] ?? null); },
        error: () => this.noEncontrado.set(true)
      });
    });
  }

  agregar(p: Producto) {
    this.carrito.agregar(p);
    this.agregado.set(true);
    setTimeout(() => this.agregado.set(false), 1600);
  }
}
