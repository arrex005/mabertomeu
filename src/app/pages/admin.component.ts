import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../core/api.service';
import { AuthService } from '../core/auth.service';
import { eur } from '../core/core';
import { DatePipe } from '@angular/common';

type Seccion = 'resumen' | 'clientes' | 'mensajes' | 'pedidos' | 'productos';

@Component({
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="contenedor pagina">
      <h1>Panel de administración</h1>

      <nav class="pestanas-admin">
        @for (s of secciones; track s.id) {
          <button [class.activa]="seccion() === s.id" (click)="cambiar(s.id)">
            {{ s.titulo }}
            @if (s.id === 'mensajes' && resumen()?.mensajes_sin_leer) {
              <span class="pip">{{ resumen()!.mensajes_sin_leer }}</span>
            }
          </button>
        }
      </nav>

      <!-- RESUMEN -->
      @if (seccion() === 'resumen') {
        @if (resumen(); as r) {
          <div class="cifras">
            <div class="cifra"><span>{{ r.clientes }}</span><em>Clientes registrados</em></div>
            <div class="cifra"><span>{{ r.verificados }}</span><em>Cuentas verificadas</em></div>
            <div class="cifra"><span>{{ r.productos }}</span><em>Piezas publicadas</em></div>
            <div class="cifra"><span>{{ r.agotados }}</span><em>Piezas agotadas</em></div>
            <div class="cifra"><span>{{ r.pedidos }}</span><em>Pedidos totales</em></div>
            <div class="cifra"><span>{{ eur(r.facturado_cents) }}</span><em>Facturado</em></div>
          </div>
        }
      }

      <!-- CLIENTES -->
      @if (seccion() === 'clientes') {
        <label class="campo buscador"><span>Buscar cliente</span>
          <input [(ngModel)]="busqueda" (ngModelChange)="buscarClientes()" placeholder="Nombre, email o usuario">
        </label>
        @if (clientes().length === 0) {
          <p class="estado-vacio">No hay clientes que mostrar.</p>
        } @else {
          <table class="tabla">
            <thead><tr>
              <th>Cliente</th><th>Contacto</th><th>Estado</th><th>Pedidos</th><th>Gastado</th><th></th>
            </tr></thead>
            <tbody>
              @for (c of clientes(); track c.id) {
                <tr>
                  <td><strong>{{ c.nombre }}</strong><br><small>{{ '@' + (c.username || '—') }}</small></td>
                  <td>{{ c.email }}<br><small>{{ c.telefono || 'Sin teléfono' }}</small></td>
                  <td>
                    @if (c.verificado) { <span class="etiqueta ok">Verificado</span> }
                    @else { <span class="etiqueta">Sin verificar</span> }
                    @if (c.rol === 'admin') { <span class="etiqueta oro">Admin</span> }
                  </td>
                  <td>{{ c.num_pedidos }}</td>
                  <td>{{ eur(c.gastado_cents) }}</td>
                  <td><button class="enlace" (click)="verCliente(c.id)">Ver ficha</button></td>
                </tr>
              }
            </tbody>
          </table>
        }

        @if (detalle(); as d) {
          <div class="ficha-cliente panel">
            <header>
              <h2>{{ d.nombre }}</h2>
              <button class="enlace" (click)="detalle.set(null)">Cerrar</button>
            </header>
            <p class="suave">{{ d.email }} · {{ d.telefono || 'Sin teléfono' }} · Alta: {{ d.creado_en | date:'dd/MM/yyyy' }}</p>
            @if (d.pedidos.length === 0) {
              <p class="suave">Todavía no ha hecho pedidos.</p>
            } @else {
              @for (p of d.pedidos; track p.id) {
                <div class="pedido-mini">
                  <strong>Pedido nº {{ p.id }}</strong> — {{ eur(p.total_cents) }}
                  <span class="etiqueta">{{ etiquetas[p.estado] || p.estado }}</span>
                  <ul>
                    @for (l of p.lineas; track l.nombre) {
                      <li>{{ l.cantidad }} × {{ l.nombre }}</li>
                    }
                  </ul>
                </div>
              }
            }
          </div>
        }
      }

      <!-- MENSAJES -->
      @if (seccion() === 'mensajes') {
        @if (mensajes().length === 0) {
          <p class="estado-vacio">No hay mensajes recibidos.</p>
        } @else {
          @for (m of mensajes(); track m.id) {
            <article class="panel mensaje" [class.nuevo]="!m.leido">
              <header>
                <div>
                  <strong>{{ m.nombre }}</strong>
                  <a [href]="'mailto:' + m.email" class="oro">{{ m.email }}</a>
                </div>
                <div class="acciones-msg">
                  <small>{{ m.creado_en | date:'dd/MM/yyyy HH:mm' }}</small>
                  <button class="enlace" (click)="marcar(m)">
                    {{ m.leido ? 'Marcar sin leer' : 'Marcar leído' }}
                  </button>
                </div>
              </header>
              <p class="cuerpo">{{ m.mensaje }}</p>
            </article>
          }
        }
      }

      <!-- PEDIDOS -->
      @if (seccion() === 'pedidos') {
        @if (pedidos().length === 0) {
          <p class="estado-vacio">Todavía no hay pedidos.</p>
        } @else {
          @for (p of pedidos(); track p.id) {
            <article class="panel pedido-admin">
              <header>
                <div>
                  <strong>Pedido nº {{ p.id }}</strong> · {{ p.cliente }} ({{ p.email }})
                  <br><small>{{ p.creado_en | date:'dd/MM/yyyy HH:mm' }} · {{ p.metodo_pago }}</small>
                </div>
                <div>
                  <strong>{{ eur(p.total_cents) }}</strong>
                  <select [ngModel]="p.estado" (ngModelChange)="cambiarEstado(p, $event)">
                    @for (e of estados; track e) { <option [value]="e">{{ etiquetas[e] }}</option> }
                  </select>
                </div>
              </header>
              <ul>
                @for (l of p.lineas; track l.nombre) {
                  <li>{{ l.cantidad }} × {{ l.nombre }} — {{ eur(l.precio_cents * l.cantidad) }}</li>
                }
              </ul>
              <p class="suave envio">
                Envío a: {{ p.direccion_envio.nombre_completo }}, {{ p.direccion_envio.calle }},
                {{ p.direccion_envio.cp }} {{ p.direccion_envio.ciudad }} ({{ p.direccion_envio.provincia }})
              </p>
            </article>
          }
        }
      }

      <!-- PRODUCTOS -->
      @if (seccion() === 'productos') {
        @if (productos().length === 0) {
          <p class="estado-vacio">Todavía no hay piezas dadas de alta.</p>
        } @else {
          <table class="tabla">
            <thead><tr><th>Pieza</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Estado</th></tr></thead>
            <tbody>
              @for (p of productos(); track p.id) {
                <tr>
                  <td>{{ p.nombre }}</td>
                  <td>{{ p.categoria }}</td>
                  <td>{{ eur(p.precio_cents) }}</td>
                  <td [class.agotado]="p.stock === 0">{{ p.stock }}</td>
                  <td>
                    @if (p.destacado) { <span class="etiqueta oro">Destacada</span> }
                    @if (!p.activo) { <span class="etiqueta">Oculta</span> }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }
        <p class="suave nota-alta">El alta de piezas con fotografías se añadirá en el siguiente bloque de trabajo.</p>
      }
    </div>
  `,
  styles: [`
    .pestanas-admin { display: flex; gap: 0.5rem; flex-wrap: wrap; border-bottom: 1px solid var(--linea); margin-bottom: 1.75rem; }
    .pestanas-admin button {
      background: none; border: none; padding: 0.7rem 1rem; font-size: 0.85rem;
      letter-spacing: 0.1em; text-transform: uppercase; color: var(--tinta-suave);
      border-bottom: 2px solid transparent;
    }
    .pestanas-admin button.activa { color: var(--tinta); border-bottom-color: var(--oro); }
    .pip {
      background: var(--oro); color: #fff; border-radius: 10px; font-size: 0.7rem;
      padding: 1px 6px; margin-left: 0.4rem;
    }
    .cifras { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 1rem; }
    .cifra {
      border: 1px solid var(--linea); background: var(--superficie);
      padding: 1.25rem; text-align: center;
    }
    .cifra span { display: block; font-family: var(--serif); font-size: 2rem; color: var(--oro-oscuro); }
    .cifra em { font-style: normal; font-size: 0.82rem; color: var(--tinta-suave); }
    .buscador { max-width: 320px; }
    .tabla { width: 100%; border-collapse: collapse; font-size: 0.92rem; background: var(--superficie); }
    .tabla th {
      text-align: left; padding: 0.7rem; border-bottom: 1px solid var(--linea);
      font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--tinta-suave);
    }
    .tabla td { padding: 0.7rem; border-bottom: 1px solid var(--linea); vertical-align: top; }
    .tabla small { color: var(--tinta-suave); }
    .etiqueta {
      display: inline-block; font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase;
      border: 1px solid var(--linea); padding: 1px 7px; margin-right: 4px; color: var(--tinta-suave);
    }
    .etiqueta.ok { border-color: var(--ok); color: var(--ok); }
    .etiqueta.oro { border-color: var(--oro); color: var(--oro-oscuro); }
    .enlace { background: none; border: none; color: var(--oro-oscuro); font-size: 0.85rem; padding: 0; }
    .ficha-cliente { margin-top: 1.5rem; }
    .ficha-cliente header { display: flex; justify-content: space-between; align-items: baseline; }
    .pedido-mini { border-top: 1px solid var(--linea); padding-top: 0.75rem; margin-top: 0.75rem; }
    .pedido-mini ul { margin: 0.3rem 0 0; padding-left: 1.1rem; color: var(--tinta-suave); font-size: 0.9rem; }
    .mensaje { margin-bottom: 1rem; }
    .mensaje.nuevo { border-left: 3px solid var(--oro); }
    .mensaje header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 0.5rem; }
    .mensaje .cuerpo { white-space: pre-wrap; color: var(--tinta-suave); margin: 0; }
    .acciones-msg { text-align: right; }
    .acciones-msg small { display: block; color: var(--tinta-suave); }
    .pedido-admin { margin-bottom: 1rem; }
    .pedido-admin header { display: flex; justify-content: space-between; gap: 1rem; }
    .pedido-admin select {
      display: block; margin-top: 0.3rem; padding: 0.3rem;
      border: 1px solid var(--linea); font: inherit; font-size: 0.85rem;
    }
    .pedido-admin ul { margin: 0.6rem 0 0; padding-left: 1.1rem; color: var(--tinta-suave); font-size: 0.9rem; }
    .envio { font-size: 0.85rem; margin: 0.6rem 0 0; }
    .agotado { color: var(--error); }
    .nota-alta { margin-top: 1.5rem; font-size: 0.88rem; }
    @media (max-width: 700px) {
      .tabla, .tabla thead, .tabla tbody, .tabla tr, .tabla td { display: block; width: 100%; }
      .tabla thead { display: none; }
      .tabla tr { border-bottom: 1px solid var(--linea); padding: 0.5rem 0; }
      .tabla td { border: none; padding: 0.2rem 0; }
    }
  `]
})
export default class AdminComponent {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  eur = eur;

  secciones = [
    { id: 'resumen' as const, titulo: 'Resumen' },
    { id: 'clientes' as const, titulo: 'Clientes' },
    { id: 'mensajes' as const, titulo: 'Mensajes' },
    { id: 'pedidos' as const, titulo: 'Pedidos' },
    { id: 'productos' as const, titulo: 'Piezas' }
  ];
  estados = ['pendiente_pago','pagado','enviado','entregado','cancelado','devuelto'];
  etiquetas: Record<string, string> = {
    pendiente_pago: 'Pendiente de pago', pagado: 'Pagado', enviado: 'Enviado',
    entregado: 'Entregado', cancelado: 'Cancelado', devuelto: 'Devuelto'
  };

  seccion = signal<Seccion>('resumen');
  resumen = signal<any>(null);
  clientes = signal<any[]>([]);
  detalle = signal<any>(null);
  mensajes = signal<any[]>([]);
  pedidos = signal<any[]>([]);
  productos = signal<any[]>([]);
  busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() {
    if (this.auth.usuario()?.rol !== 'admin') { this.router.navigateByUrl('/'); return; }
    this.api.adminResumen().subscribe({ next: r => this.resumen.set(r), error: () => {} });
  }

  cambiar(s: Seccion) {
    this.seccion.set(s);
    this.detalle.set(null);
    if (s === 'clientes' && !this.clientes().length) this.buscarClientes();
    if (s === 'mensajes') this.api.adminMensajes().subscribe({ next: m => this.mensajes.set(m), error: () => {} });
    if (s === 'pedidos') this.api.adminPedidos().subscribe({ next: p => this.pedidos.set(p), error: () => {} });
    if (s === 'productos') this.api.adminProductos().subscribe({ next: p => this.productos.set(p), error: () => {} });
  }

  buscarClientes() {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.api.adminClientes(this.busqueda).subscribe({ next: c => this.clientes.set(c), error: () => {} });
    }, 300);
  }

  verCliente(id: number) {
    this.api.adminCliente(id).subscribe({ next: d => this.detalle.set(d), error: () => {} });
  }

  marcar(m: any) {
    const nuevo = !m.leido;
    this.api.adminMarcarMensaje(m.id, nuevo).subscribe({
      next: () => {
        m.leido = nuevo;
        this.api.adminResumen().subscribe({ next: r => this.resumen.set(r), error: () => {} });
      },
      error: () => {}
    });
  }

  cambiarEstado(p: any, estado: string) {
    this.api.adminCambiarEstado(p.id, estado).subscribe({
      next: () => p.estado = estado,
      error: () => {}
    });
  }
}