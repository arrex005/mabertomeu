import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Producto, Facetas } from './core';

export const API = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  productos(filtros: Record<string, string>) {
    return this.http.get<{ total: number; productos: Producto[] }>(
      `${API}/productos`, { params: new HttpParams({ fromObject: filtros }) });
  }
  facetas(filtros: Record<string, string>) {
    return this.http.get<Facetas>(`${API}/productos/facetas`,
      { params: new HttpParams({ fromObject: filtros }) });
  }
  destacados() { return this.http.get<Producto[]>(`${API}/productos/destacados`); }
  producto(slug: string) { return this.http.get<Producto>(`${API}/productos/${slug}`); }
  contacto(datos: { nombre: string; email: string; mensaje: string }) {
    return this.http.post<{ ok: boolean }>(`${API}/contacto`, datos);
  }
  crearPedido(datos: unknown) {
    return this.http.post<{ pedido_id: number; redsys: { url: string; body: Record<string, string> } }>(
      `${API}/pedidos`, datos);
  }
  misPedidos() { return this.http.get<any[]>(`${API}/pedidos/mios`); }
}