export interface Producto {
  id: number; nombre: string; slug: string; precio_cents: number;
  stock: number; imagen?: string | null; categoria?: string;
  descripcion?: string; imagenes?: string[]; materiales?: string[]; piedras?: string[];
}
export interface Faceta { id: number; nombre: string; slug?: string; n: number; }
export interface Facetas {
  categorias: Faceta[]; materiales: Faceta[]; piedras: Faceta[];
  disponibilidad: { en_stock: number; total: number };
  precio: { min: number; max: number };
}
export interface Usuario {
  id: number; nombre: string; username?: string; email: string; rol: string; verificado?: boolean;
}

export const eur = (cents: number) =>
  (cents / 100).toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });