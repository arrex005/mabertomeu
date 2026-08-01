import { Component, inject, signal } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';
import { Producto, Facetas, eur } from '../core/core';

@Component({
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="contenedor pagina">
      <header class="cabecera-catalogo">
        <h1>Catálogo</h1>
        @if (total() !== null) { <p class="conteo">{{ total() }} piezas</p> }
      </header>

      <div class="disposicion">
        <!-- Panel de filtros -->
        <aside class="filtros" [class.abierto]="filtrosAbiertos()">
          <button class="btn btn-fantasma solo-movil" (click)="filtrosAbiertos.set(!filtrosAbiertos())">
            {{ filtrosAbiertos() ? 'Ocultar filtros' : 'Filtrar' }}
          </button>

          <div class="panel-filtros">
            <label class="campo">
              <span>Buscar</span>
              <input [(ngModel)]="busqueda" (ngModelChange)="buscarConRetardo()" placeholder="Peineta, aguja…">
            </label>

            @if (facetas(); as f) {
              <details open>
                <summary>Producto</summary>
                @for (c of f.categorias; track c.id) {
                  <label class="opcion">
                    <input type="radio" name="categoria" [checked]="categoria === c.slug"
                           (change)="elegirCategoria(c.slug!)">
                    {{ c.nombre }} <em>({{ c.n }})</em>
                  </label>
                }
                @if (categoria) {
                  <button class="limpiar" (click)="elegirCategoria('')">Quitar categoría</button>
                }
              </details>

              <details open>
                <summary>Material</summary>
                @for (m of f.materiales; track m.id) {
                  <label class="opcion">
                    <input type="checkbox" [checked]="materiales.has(m.id)" (change)="alternar(materiales, m.id)">
                    {{ m.nombre }} <em>({{ m.n }})</em>
                  </label>
                }
              </details>

              <details>
                <summary>Piedra / color</summary>
                @for (p of f.piedras; track p.id) {
                  <label class="opcion">
                    <input type="checkbox" [checked]="piedras.has(p.id)" (change)="alternar(piedras, p.id)">
                    {{ p.nombre }} <em>({{ p.n }})</em>
                  </label>
                }
              </details>

              <details open>
                <summary>Disponibilidad</summary>
                <label class="opcion">
                  <input type="checkbox" [(ngModel)]="soloStock" (ngModelChange)="cargar()">
                  En stock <em>({{ f.disponibilidad.en_stock }})</em>
                </label>
              </details>

              <details open>
                <summary>Precio</summary>
                <div class="rango">
                  <input type="number" [(ngModel)]="precioMin" (change)="cargar()" placeholder="Mín" min="0"
                         aria-label="Precio mínimo">
                  <span>—</span>
                  <input type="number" [(ngModel)]="precioMax" (change)="cargar()" placeholder="Máx" min="0"
                         aria-label="Precio máximo">
                </div>
              </details>

              @if (hayFiltros()) {
                <button class="btn btn-fantasma btn-ancho limpiar-todo" (click)="limpiarTodo()">Limpiar filtros</button>
              }
            } @else {
              <p class="cargando-filtros">Los filtros aparecerán cuando el catálogo esté conectado.</p>
            }
          </div>
        </aside>

        <!-- Resultados -->
        <section>
          @if (cargando()) {
            <p class="estado-vacio">Cargando piezas…</p>
          } @else if (productos().length === 0) {
            <p class="estado-vacio">Todavía no hay piezas publicadas en el catálogo.</p>
          } @else {
            <div class="grid-productos">
              @for (p of productos(); track p.id) {
                <a class="tarjeta-producto" [routerLink]="['/producto', p.slug]">
                  <div class="marco">
                    @if (p.imagen) { <img [src]="p.imagen" [alt]="p.nombre" loading="lazy"> }
                    @else { <span class="sin-foto">MB</span> }
                  </div>
                  <h3>{{ p.nombre }}</h3>
                  <p class="precio">{{ eur(p.precio_cents) }}</p>
                  @if (p.stock === 0) { <p class="agotado">Agotado — consúltanos</p> }
                </a>
              }
            </div>
            @if (total()! > productos().length) {
              <div class="mas">
                <button class="btn btn-fantasma" (click)="cargarMas()">Ver más piezas</button>
              </div>
            }
          }
        </section>
      </div>
    </div>
  `,
  styles: [`
    .cabecera-catalogo { display: flex; align-items: baseline; gap: 1rem; margin-bottom: 1.75rem; }
    .conteo { color: var(--tinta-suave); margin: 0; }
    .disposicion { display: grid; grid-template-columns: 250px 1fr; gap: 2.5rem; align-items: start; }
    .panel-filtros {
      border: 1px solid var(--linea); border-radius: var(--radio);
      padding: 1.1rem; background: var(--superficie);
    }
    details { border-bottom: 1px solid var(--linea); padding: 0.6rem 0; }
    details:last-of-type { border-bottom: none; }
    summary {
      cursor: pointer; font-size: 0.82rem; letter-spacing: 0.12em;
      text-transform: uppercase; color: var(--tinta); margin-bottom: 0.35rem;
    }
    .opcion {
      display: flex; align-items: center; gap: 0.5rem;
      font-size: 0.92rem; padding: 0.18rem 0; cursor: pointer; color: var(--tinta-suave);
    }
    .opcion em { color: var(--tinta-suave); font-style: normal; font-size: 0.8rem; opacity: 0.75; }
    .opcion input { accent-color: var(--oro); }
    .limpiar { background: none; border: none; color: var(--oro-oscuro); font-size: 0.85rem; padding: 0.3rem 0; }
    .limpiar-todo { margin-top: 0.9rem; padding: 0.6rem; }
    .rango { display: flex; align-items: center; gap: 0.4rem; }
    .rango input {
      width: 100%; padding: 0.45rem 0.5rem; border: 1px solid var(--linea);
      border-radius: var(--radio); font: inherit;
    }
    .cargando-filtros { color: var(--tinta-suave); font-size: 0.88rem; margin: 0; }
    .mas { text-align: center; margin-top: 2.5rem; }
    .solo-movil { display: none; }
    @media (max-width: 860px) {
      .disposicion { grid-template-columns: 1fr; gap: 1rem; }
      .solo-movil { display: block; width: 100%; margin-bottom: 0.75rem; }
      .panel-filtros { display: none; }
      .filtros.abierto .panel-filtros { display: block; }
    }
  `]
})
export default class CatalogoComponent {
  private api = inject(ApiService);
  private ruta = inject(ActivatedRoute);
  eur = eur;

  productos = signal<Producto[]>([]);
  facetas = signal<Facetas | null>(null);
  total = signal<number | null>(null);
  cargando = signal(true);
  filtrosAbiertos = signal(false);

  busqueda = '';
  categoria = '';
  materiales = new Set<number>();
  piedras = new Set<number>();
  soloStock = false;
  precioMin: number | null = null;
  precioMax: number | null = null;
  pagina = 1;
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit() {
    this.categoria = this.ruta.snapshot.queryParamMap.get('categoria') ?? '';
    this.cargar();
  }

  private filtros(): Record<string, string> {
    const f: Record<string, string> = {};
    if (this.busqueda.trim()) f['busqueda'] = this.busqueda.trim();
    if (this.categoria) f['categoria'] = this.categoria;
    if (this.materiales.size) f['materiales'] = [...this.materiales].join(',');
    if (this.piedras.size) f['piedras'] = [...this.piedras].join(',');
    if (this.soloStock) f['disponible'] = 'true';
    if (this.precioMin) f['precio_min'] = String(this.precioMin);
    if (this.precioMax) f['precio_max'] = String(this.precioMax);
    return f;
  }

  cargar(reiniciar = true) {
    if (reiniciar) this.pagina = 1;
    this.cargando.set(true);
    this.api.productos({ ...this.filtros(), pagina: String(this.pagina) }).subscribe({
      next: r => {
        this.productos.update(prev => this.pagina === 1 ? r.productos : [...prev, ...r.productos]);
        this.total.set(r.total);
        this.cargando.set(false);
      },
      error: () => { this.cargando.set(false); this.total.set(0); }
    });
    this.api.facetas(this.filtros()).subscribe({ next: f => this.facetas.set(f), error: () => {} });
  }

  cargarMas() { this.pagina++; this.cargar(false); }

  buscarConRetardo() {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.cargar(), 350);
  }

  elegirCategoria(slug: string) {
    this.categoria = this.categoria === slug ? '' : slug;
    this.cargar();
  }

  alternar(conjunto: Set<number>, id: number) {
    conjunto.has(id) ? conjunto.delete(id) : conjunto.add(id);
    this.cargar();
  }

  hayFiltros() {
    return !!(this.categoria || this.materiales.size || this.piedras.size
      || this.soloStock || this.precioMin || this.precioMax || this.busqueda);
  }

  limpiarTodo() {
    this.busqueda = ''; this.categoria = '';
    this.materiales.clear(); this.piedras.clear();
    this.soloStock = false; this.precioMin = this.precioMax = null;
    this.cargar();
  }
}