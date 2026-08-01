import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Producto, eur } from '../core/core';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <!-- Hero -->
    <section class="hero">
      <div class="contenedor">
        <p class="eyebrow">Goldsmith & 3D Design Studio · Valencia</p>
        <h1>Aderezos que cuentan<br>tu historia fallera</h1>
        <p class="entrada">
          En MA. BERTOMEU unimos la orfebrería tradicional valenciana con el diseño 3D
          para crear aderezos, peinetas y joyas de indumentaria hechos para durar
          generaciones. Cada pieza sale de nuestro taller con el mismo cuidado con el
          que tú preparas cada Fallas.
        </p>
        <a routerLink="/catalogo" class="btn">Ver catálogo</a>
      </div>
      <svg class="arco" viewBox="0 0 120 22" aria-hidden="true">
        <path d="M4 20 Q60 -14 116 20" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </section>

    <!-- Destacados -->
    <section class="contenedor cabecera-seccion">
      <h2 class="titulo-seccion">Piezas destacadas</h2>
      <svg class="arco" viewBox="0 0 120 22" aria-hidden="true">
        <path d="M4 20 Q60 -14 116 20" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </section>
    <section class="contenedor">
      @if (destacados().length === 0) {
        <p class="vacio">Muy pronto encontrarás aquí nuestras piezas destacadas.</p>
      } @else {
        <div class="grid-productos">
          @for (p of destacados(); track p.id) {
            <a class="tarjeta-producto" [routerLink]="['/producto', p.slug]">
              <div class="marco">
                @if (p.imagen) { <img [src]="p.imagen" [alt]="p.nombre"> }
                @else { <span class="sin-foto">MB</span> }
              </div>
              <h3>{{ p.nombre }}</h3>
              <p class="precio">{{ eur(p.precio_cents) }}</p>
            </a>
          }
        </div>
      }
    </section>

    <!-- Contacto -->
    <section class="contenedor cabecera-seccion" id="contacto">
      <h2 class="titulo-seccion">¿Hablamos?</h2>
      <svg class="arco" viewBox="0 0 120 22" aria-hidden="true">
        <path d="M4 20 Q60 -14 116 20" fill="none" stroke="currentColor" stroke-width="1.5"/>
      </svg>
    </section>
    <section class="contenedor contacto">
      <p class="entrada centrada">
        Si buscas una pieza concreta, un encargo a medida o tienes cualquier duda,
        escríbenos y te contestamos por correo lo antes posible.
      </p>
      <form (ngSubmit)="enviar()" class="formulario">
        <div class="fila">
          <label class="campo"><span>Nombre</span>
            <input name="nombre" [(ngModel)]="contacto.nombre" required minlength="2">
          </label>
          <label class="campo"><span>Email</span>
            <input name="email" type="email" [(ngModel)]="contacto.email" required>
          </label>
        </div>
        <label class="campo"><span>Mensaje</span>
          <textarea name="mensaje" rows="5" [(ngModel)]="contacto.mensaje" required minlength="10"></textarea>
        </label>
        @if (estado() === 'ok') { <p class="aviso-ok">Mensaje enviado. Te responderemos muy pronto.</p> }
        @if (estado() === 'error') { <p class="aviso-error">{{ mensajeError }}</p> }
        <button class="btn" [disabled]="estado() === 'enviando'">
          {{ estado() === 'enviando' ? 'Enviando…' : 'Enviar mensaje' }}
        </button>
      </form>
    </section>
  `,
  styles: [`
    .hero { text-align: center; padding: 5.5rem 0 3rem; }
    .eyebrow {
      letter-spacing: 0.3em; text-transform: uppercase; font-size: 0.78rem;
      color: var(--oro-oscuro); margin-bottom: 1rem;
    }
    .entrada { max-width: 62ch; margin: 1.25rem auto 2rem; color: var(--tinta-suave); font-size: 1.05rem; }
    .centrada { text-align: center; }
    .vacio { text-align: center; color: var(--tinta-suave); padding: 2rem 0; }
    .contacto { max-width: 680px; }
    .formulario { margin-top: 1.5rem; text-align: center; }
    .formulario .campo { text-align: left; }
    .fila { display: grid; gap: 0 1.25rem; grid-template-columns: 1fr 1fr; }
    @media (max-width: 600px) { .fila { grid-template-columns: 1fr; } }
  `]
})
export default class InicioComponent {
  private api = inject(ApiService);
  eur = eur;
  destacados = signal<Producto[]>([]);
  contacto = { nombre: '', email: '', mensaje: '' };
  estado = signal<'inicial' | 'enviando' | 'ok' | 'error'>('inicial');
  mensajeError = '';

  ngOnInit() {
    this.api.destacados().subscribe({ next: d => this.destacados.set(d), error: () => {} });
  }

  enviar() {
    this.estado.set('enviando');
    this.api.contacto(this.contacto).subscribe({
      next: () => { this.estado.set('ok'); this.contacto = { nombre: '', email: '', mensaje: '' }; },
      error: (e) => {
        this.mensajeError = e.error?.error ?? 'No se pudo enviar, inténtalo de nuevo';
        this.estado.set('error');
      }
    });
  }
}