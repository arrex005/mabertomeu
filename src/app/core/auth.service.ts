import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpInterceptorFn } from '@angular/common/http';
import { Usuario } from './core';
import { API } from './api.service';

const CLAVE = 'mb_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  usuario = signal<Usuario | null>(leerUsuario());

  login(identificador: string, password: string) {
    return this.http.post<{ token: string; usuario: Usuario }>(`${API}/auth/login`, { identificador, password });
  }
  registro(datos: { nombre: string; username: string; email: string; password: string; telefono?: string }) {
    return this.http.post<{ token: string; usuario: Usuario }>(`${API}/auth/registro`, datos);
  }
  entrar(token: string, usuario: Usuario) {
    localStorage.setItem(CLAVE, token);
    this.usuario.set(usuario);
  }
  salir() {
    localStorage.removeItem(CLAVE);
    this.usuario.set(null);
  }
}

function leerUsuario(): Usuario | null {
  const token = localStorage.getItem(CLAVE);
  if (!token) return null;
  try {
    const cuerpo = JSON.parse(atob(token.split('.')[1]));
    if (cuerpo.exp * 1000 < Date.now()) { localStorage.removeItem(CLAVE); return null; }
    return { id: cuerpo.id, nombre: cuerpo.nombre, email: cuerpo.email, rol: cuerpo.rol };
  } catch { return null; }
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem(CLAVE);
  if (token && req.url.startsWith(API)) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};
