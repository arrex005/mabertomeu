import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/auth.service';
import { ApiService } from '../core/api.service';
import { eur } from '../core/core';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="contenedor pagina estrecho">
      @if (auth.usuario(); as u) {
        <h1>Hola, {{ u.nombre }}</h1>
        <p class="suave">{{ u.email }}</p>

        <h2 class="sub">Mis pedidos</h2>
        @if (pedidos().length === 0) {
          <p class="suave">Todavía no has hecho ningún pedido.</p>
        } @else {
          @for (p of pedidos(); track p.id) {
            <article class="panel pedido">
              <header>
                <strong>Pedido nº {{ p.id }}</strong>
                <span class="estado">{{ etiquetas[p.estado] || p.estado }}</span>
              </header>
              <ul>
                @for (l of p.lineas; track l.nombre) {
                  <li>{{ l.cantidad }} × {{ l.nombre }} — {{ eur(l.precio_cents * l.cantidad) }}</li>
                }
              </ul>
              <footer>Total: <strong>{{ eur(p.total_cents) }}</strong></footer>
            </article>
          }
        }
        <button class="btn btn-fantasma" (click)="salir()">Cerrar sesión</button>
      } @else {
        <div class="panel tarjeta-auth">
          <div class="pestanas">
            <button [class.activa]="modo() === 'login'" (click)="modo.set('login')">Iniciar sesión</button>
            <button [class.activa]="modo() === 'registro'" (click)="modo.set('registro')">Crear cuenta</button>
          </div>
          <form (ngSubmit)="enviar()">
            @if (modo() === 'registro') {
              <label class="campo"><span>Nombre</span>
                <input name="nombre" [(ngModel)]="datos.nombre" required minlength="2"></label>
            }
            <label class="campo"><span>Email</span>
              <input name="email" type="email" [(ngModel)]="datos.email" required></label>
            <label class="campo"><span>Contraseña</span>
              <input name="password" type="password" [(ngModel)]="datos.password" required minlength="8"></label>
            @if (error()) { <p class="aviso-error">{{ error() }}</p> }
            <button class="btn btn-ancho" [disabled]="enviando()">
              {{ modo() === 'login' ? 'Entrar' : 'Crear mi cuenta' }}
            </button>
          </form>
        </div>
      }
    </div>
  `,
  styles: [`
    .estrecho { max-width: 720px; }
    .sub { margin-top: 2rem; }
    .pedido { padding: 1rem 1.25rem; margin-bottom: 1rem; }
    .pedido header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
    .pedido ul { margin: 0; padding-left: 1.1rem; color: var(--tinta-suave); }
    .pedido footer { margin-top: 0.5rem; }
    .estado {
      font-size: 0.8rem; letter-spacing: 0.08em;
      text-transform: uppercase; color: var(--oro-oscuro);
    }
    .tarjeta-auth { max-width: 420px; margin: 2rem auto; }
    .pestanas { display: flex; margin-bottom: 1.5rem; border-bottom: 1px solid var(--linea); }
    .pestanas button {
      flex: 1; background: none; border: none; padding: 0.7rem;
      font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase;
      color: var(--tinta-suave); border-bottom: 2px solid transparent;
    }
    .pestanas button.activa { color: var(--tinta); border-bottom-color: var(--oro); }
  `]
})
export default class CuentaComponent {
  auth = inject(AuthService);
  private api = inject(ApiService);
  private router = inject(Router);
  eur = eur;

  modo = signal<'login' | 'registro'>('login');
  datos = { nombre: '', email: '', password: '' };
  error = signal('');
  enviando = signal(false);
  pedidos = signal<any[]>([]);

  etiquetas: Record<string, string> = {
    pendiente_pago: 'Pendiente de pago', pagado: 'Pagado', enviado: 'Enviado',
    entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto'
  };

  ngOnInit() { if (this.auth.usuario()) this.cargarPedidos(); }

  cargarPedidos() {
    this.api.misPedidos().subscribe({ next: p => this.pedidos.set(p), error: () => {} });
  }

  enviar() {
    this.error.set('');
    this.enviando.set(true);
    const obs = this.modo() === 'login'
      ? this.auth.login(this.datos.email, this.datos.password)
      : this.auth.registro(this.datos.nombre, this.datos.email, this.datos.password);
    obs.subscribe({
      next: r => {
        this.auth.entrar(r.token, r.usuario);
        this.enviando.set(false);
        this.cargarPedidos();
      },
      error: e => {
        this.error.set(e.error?.error ?? 'Algo ha fallado, inténtalo de nuevo');
        this.enviando.set(false);
      }
    });
  }

  salir() { this.auth.salir(); this.router.navigateByUrl('/'); }
}