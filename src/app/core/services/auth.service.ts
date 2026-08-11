import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, UsuarioActual } from '../models/usuario.model';

const CLAVE_TOKEN = 'lapreplus_token';
const CLAVE_USUARIO = 'lapreplus_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/auth`;

  /** Usuario en sesión, como signal reactivo (la UI se actualiza sola). */
  usuario = signal<UsuarioActual | null>(this.leerUsuarioGuardado());
  autenticado = computed(() => this.usuario() !== null);

  login(credenciales: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.url}/login`, credenciales).pipe(
      tap((resp) => {
        localStorage.setItem(CLAVE_TOKEN, resp.token);
        const actual: UsuarioActual = {
          username: resp.username,
          nombre: resp.nombre,
          roles: resp.roles
        };
        localStorage.setItem(CLAVE_USUARIO, JSON.stringify(actual));
        this.usuario.set(actual);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(CLAVE_TOKEN);
    localStorage.removeItem(CLAVE_USUARIO);
    this.usuario.set(null);
  }

  get token(): string | null {
    return localStorage.getItem(CLAVE_TOKEN);
  }

  /** Comprueba si el usuario tiene alguno de los roles indicados (p.ej. 'ROLE_ADMIN'). */
  tieneRol(...roles: string[]): boolean {
    const u = this.usuario();
    return !!u && roles.some((r) => u.roles.includes(r));
  }

  private leerUsuarioGuardado(): UsuarioActual | null {
    const crudo = localStorage.getItem(CLAVE_USUARIO);
    return crudo ? (JSON.parse(crudo) as UsuarioActual) : null;
  }
}
