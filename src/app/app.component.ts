import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CartService } from './core/cart.service';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <header class="cabecera">
      <div class="contenedor barra">
        <a routerLink="/" class="logo" aria-label="MA. BERTOMEU — inicio">
          <img src="logo.png" alt="MA. BERTOMEU · Goldsmith & 3D Design Studio">
        </a>

        <nav class="navegacion" aria-label="Principal">
          <a routerLink="/" routerLinkActive="activo" [routerLinkActiveOptions]="{exact: true}">Inicio</a>
          <a routerLink="/catalogo" routerLinkActive="activo">Catálogo</a>
          <a routerLink="/como-comprar" routerLinkActive="activo">Cómo comprar</a>
          @if (auth.usuario()?.rol === 'admin') {
            <a routerLink="/admin" routerLinkActive="activo">Panel</a>
          }
        </nav>

        <div class="acciones">
          <a routerLink="/cuenta" class="icono" [attr.aria-label]="auth.usuario() ? 'Mi cuenta' : 'Iniciar sesión'">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>
            </svg>
            @if (auth.usuario(); as u) { <span class="nombre">{{ u.nombre.split(' ')[0] }}</span> }
          </a>
          <a routerLink="/carrito" class="icono" aria-label="Carrito">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4">
              <path d="M6 7h13l-1.5 9h-10L5 4H2"/><circle cx="9" cy="20" r="1.4"/><circle cx="16" cy="20" r="1.4"/>
            </svg>
            @if (carrito.totalArticulos() > 0) {
              <span class="burbuja">{{ carrito.totalArticulos() }}</span>
            }
          </a>
        </div>
      </div>
    </header>

    <main><router-outlet /></main>

    <footer class="pie">
      <div class="contenedor pie-grid">
        <div>
          <img src="logo.png" alt="" class="pie-logo">
          <p>Orfebrería y diseño 3D para la indumentaria fallera. Hecho en Valencia.</p>
        </div>
        <nav aria-label="Pie de página">
          <h3>Navegación</h3>
          <a routerLink="/">Inicio</a>
          <a routerLink="/catalogo">Catálogo</a>
          <a routerLink="/como-comprar">Cómo comprar</a>
        </nav>
        <div>
          <h3>Contacto</h3>
          <p>Valencia, España<br>Escríbenos desde el formulario de contacto.</p>
        </div>
      </div>
      <div class="contenedor legal">
        © {{ anyo }} MA. BERTOMEU · Todos los precios incluyen IVA
      </div>
    </footer>
  `,
  styles: [`
    .cabecera {
      position: sticky; top: 0; z-index: 20;
      background: rgba(253, 252, 248, 0.94); backdrop-filter: blur(6px);
      border-bottom: 1px solid var(--linea);
    }
    .barra { display: flex; align-items: center; gap: 2rem; height: 76px; }
    .logo img { height: 52px; width: auto; }
    .navegacion { display: flex; gap: 1.75rem; margin-left: auto; }
    .navegacion a {
      font-size: 0.9rem; letter-spacing: 0.14em; text-transform: uppercase;
      padding: 0.4rem 0; border-bottom: 1px solid transparent;
    }
    .navegacion a:hover, .navegacion a.activo { border-bottom-color: var(--oro); color: var(--oro-oscuro); }
    .acciones { display: flex; gap: 1.1rem; align-items: center; }
    .icono { position: relative; display: flex; align-items: center; gap: 0.4rem; }
    .icono svg { width: 24px; height: 24px; }
    .icono:hover { color: var(--oro-oscuro); }
    .nombre { font-size: 0.85rem; }
    .burbuja {
      position: absolute; top: -7px; right: -9px;
      background: var(--oro); color: #fff; border-radius: 50%;
      font-size: 0.68rem; min-width: 17px; height: 17px;
      display: grid; place-items: center; padding: 0 3px;
    }
    main { min-height: 70vh; }
    .pie { border-top: 1px solid var(--linea); margin-top: 5rem; background: var(--superficie); }
    .pie-grid { display: grid; gap: 2.5rem; grid-template-columns: 2fr 1fr 1fr; padding: 3rem 1.25rem 2rem; }
    .pie-logo { height: 44px; width: auto; margin-bottom: 0.75rem; }
    .pie p { color: var(--tinta-suave); font-size: 0.95rem; max-width: 34ch; }
    .pie h3 { font-size: 1.05rem; }
    .pie nav a { display: block; padding: 0.2rem 0; color: var(--tinta-suave); font-size: 0.95rem; }
    .pie nav a:hover { color: var(--oro-oscuro); }
    .legal {
      border-top: 1px solid var(--linea); padding: 1.1rem 1.25rem;
      font-size: 0.82rem; color: var(--tinta-suave); letter-spacing: 0.06em;
    }
    @media (max-width: 760px) {
      .barra { gap: 1rem; flex-wrap: wrap; height: auto; padding: 0.6rem 0; }
      .navegacion { order: 3; width: 100%; justify-content: center; margin: 0; }
      .acciones { margin-left: auto; }
      .pie-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class AppComponent {
  carrito = inject(CartService);
  auth = inject(AuthService);
  anyo = new Date().getFullYear();
}
