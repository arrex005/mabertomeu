import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../core/cart.service';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { eur } from '../core/core';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="contenedor pagina">
      <h1>Tu carrito</h1>

      @if (carrito.lineas().length === 0) {
        <p class="suave">Tu carrito está vacío. <a routerLink="/catalogo" class="oro">Descubre nuestras piezas</a>.</p>
      } @else {
        <div class="disposicion">
          <section class="lineas">
            @for (l of carrito.lineas(); track l.producto_id) {
              <article class="linea">
                <a [routerLink]="['/producto', l.slug]" class="mini">
                  @if (l.imagen) { <img [src]="l.imagen" [alt]="l.nombre"> }
                  @else { <span class="sin-foto">MB</span> }
                </a>
                <div class="info">
                  <a [routerLink]="['/producto', l.slug]"><h3>{{ l.nombre }}</h3></a>
                  <p class="unitario">{{ eur(l.precio_cents) }} / unidad</p>
                </div>
                <div class="cantidad" role="group" [attr.aria-label]="'Cantidad de ' + l.nombre">
                  <button (click)="carrito.cambiarCantidad(l.producto_id, l.cantidad - 1)" aria-label="Quitar una">−</button>
                  <span>{{ l.cantidad }}</span>
                  <button (click)="carrito.cambiarCantidad(l.producto_id, l.cantidad + 1)"
                          [disabled]="l.cantidad >= l.stock" aria-label="Añadir una">+</button>
                </div>
                <p class="subtotal">{{ eur(l.precio_cents * l.cantidad) }}</p>
                <button class="quitar" (click)="carrito.quitar(l.producto_id)" aria-label="Quitar del carrito">✕</button>
              </article>
            }
          </section>

          <aside class="panel resumen">
            <h2>Resumen</h2>
            <p class="fila-total">
              <span>Subtotal (IVA incluido)</span>
              <strong>{{ eur(carrito.totalCents()) }}</strong>
            </p>
            <p class="nota">Los gastos de envío se calculan al confirmar el pedido.</p>

            @if (!auth.usuario()) {
              <p class="aviso-caja">
                Para comprar necesitas <a routerLink="/cuenta" class="oro">iniciar sesión o crear una cuenta</a>.
              </p>
            } @else if (!mostrandoCheckout()) {
              <button class="btn btn-ancho" (click)="mostrandoCheckout.set(true)">Tramitar pedido</button>
            } @else {
              <form (ngSubmit)="pagar()">
                <h3>Dirección de envío</h3>
                <label class="campo"><span>Nombre completo</span>
                  <input name="nc" [(ngModel)]="direccion.nombre_completo" required></label>
                <label class="campo"><span>Calle y número</span>
                  <input name="calle" [(ngModel)]="direccion.calle" required></label>
                <div class="fila-campos">
                  <label class="campo"><span>Código postal</span>
                    <input name="cp" [(ngModel)]="direccion.cp" required></label>
                  <label class="campo"><span>Ciudad</span>
                    <input name="ciudad" [(ngModel)]="direccion.ciudad" required></label>
                </div>
                <div class="fila-campos">
                  <label class="campo"><span>Provincia</span>
                    <input name="provincia" [(ngModel)]="direccion.provincia" required></label>
                  <label class="campo"><span>Teléfono</span>
                    <input name="tel" [(ngModel)]="direccion.telefono"></label>
                </div>

                <h3>Pago</h3>
                <label class="opcion-pago">
                  <input type="radio" name="pago" value="tarjeta" [(ngModel)]="metodoPago"> Tarjeta
                </label>
                <label class="opcion-pago">
                  <input type="radio" name="pago" value="bizum" [(ngModel)]="metodoPago"> Bizum
                </label>
                <p class="nota">
                  El pago se realiza en la pasarela segura de tu banco. Nunca guardamos los datos de tu tarjeta.
                </p>

                @if (error()) { <p class="aviso-error">{{ error() }}</p> }
                <button class="btn btn-ancho" [disabled]="pagando()">
                  {{ pagando() ? 'Conectando con el banco…' : 'Pagar ' + eur(carrito.totalCents()) }}
                </button>
              </form>
            }
          </aside>
        </div>
      }
    </div>
  `,
  styles: [`
    .disposicion { display: grid; grid-template-columns: 1fr 360px; gap: 2.5rem; align-items: start; }
    .linea {
      display: grid; grid-template-columns: 80px 1fr auto auto auto;
      gap: 1rem; align-items: center; padding: 1rem 0; border-bottom: 1px solid var(--linea);
    }
    .mini {
      width: 80px; height: 80px; border: 1px solid var(--linea);
      display: grid; place-items: center; overflow: hidden;
    }
    .mini img { width: 100%; height: 100%; object-fit: cover; }
    .info h3 { font-size: 1.1rem; margin: 0; }
    .unitario { color: var(--tinta-suave); font-size: 0.85rem; margin: 0.15rem 0 0; }
    .cantidad {
      display: flex; align-items: center; gap: 0.6rem;
      border: 1px solid var(--linea); border-radius: var(--radio); padding: 0.2rem 0.5rem;
    }
    .cantidad button { background: none; border: none; font-size: 1.1rem; color: var(--oro-oscuro); width: 24px; }
    .cantidad button:disabled { opacity: 0.35; cursor: not-allowed; }
    .subtotal { min-width: 80px; text-align: right; margin: 0; }
    .quitar { background: none; border: none; color: var(--tinta-suave); }
    .quitar:hover { color: var(--error); }
    .resumen h2 { font-size: 1.4rem; }
    .fila-total { display: flex; justify-content: space-between; font-size: 1.05rem; margin-bottom: 0.3rem; }
    .nota { color: var(--tinta-suave); font-size: 0.85rem; }
    .resumen h3 { margin-top: 1.25rem; font-size: 1.1rem; }
    .opcion-pago { display: flex; gap: 0.5rem; align-items: center; padding: 0.25rem 0; cursor: pointer; }
    .opcion-pago input { accent-color: var(--oro); }
    .btn-ancho { margin-top: 0.75rem; }
    @media (max-width: 860px) {
      .disposicion { grid-template-columns: 1fr; }
      .linea { grid-template-columns: 64px 1fr auto; }
      .subtotal { text-align: left; }
    }
  `]
})
export default class CarritoComponent {
  carrito = inject(CartService);
  auth = inject(AuthService);
  private api = inject(ApiService);
  eur = eur;

  mostrandoCheckout = signal(false);
  pagando = signal(false);
  error = signal('');
  metodoPago: 'tarjeta' | 'bizum' = 'tarjeta';
  direccion = { nombre_completo: '', calle: '', cp: '', ciudad: '', provincia: '', telefono: '' };

  pagar() {
    this.error.set('');
    this.pagando.set(true);
    this.api.crearPedido({
      lineas: this.carrito.lineas().map(l => ({ producto_id: l.producto_id, cantidad: l.cantidad })),
      direccion: this.direccion,
      metodo_pago: this.metodoPago
    }).subscribe({
      next: r => {
        this.carrito.vaciar();
        // Redirección al TPV: formulario firmado que se autoenvía
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = r.redsys.url;
        for (const [k, v] of Object.entries(r.redsys.body)) {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = v;
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      },
      error: e => {
        this.error.set(e.error?.error ?? 'No se pudo iniciar el pago, inténtalo de nuevo');
        this.pagando.set(false);
      }
    });
  }
}