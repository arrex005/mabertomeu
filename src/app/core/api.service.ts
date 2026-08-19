import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Producto, Facetas } from './core';

export const API = location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : 'https://mabertomeu-api-production.up.railway.app/api';

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
  
  // --- Administración ---
  adminResumen() { return this.http.get<any>(`${API}/admin/resumen`); }
  adminClientes(busqueda = '') {
    return this.http.get<any[]>(`${API}/admin/clientes`, { params: busqueda ? { busqueda } : {} });
  }
  adminCliente(id: number) { return this.http.get<any>(`${API}/admin/clientes/${id}`); }
  adminMensajes() { return this.http.get<any[]>(`${API}/admin/mensajes`); }
  adminMarcarMensaje(id: number, leido: boolean) {
    return this.http.patch(`${API}/admin/mensajes/${id}`, { leido });
  }
  adminPedidos() { return this.http.get<any[]>(`${API}/admin/pedidos`); }
  adminCambiarEstado(id: number, estado: string) {
    return this.http.patch(`${API}/admin/pedidos/${id}/estado`, { estado });
  }
  adminProductos() { return this.http.get<any[]>(`${API}/admin/productos`); }
  meta() { return this.http.get<any>(`${API}/meta`); }

}