import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaUsuarios, RolOpcion, UsuarioAdmin, UsuarioRequest } from '../models/usuario-admin.model';

@Injectable({ providedIn: 'root' })
export class UsuarioAdminService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/usuarios`;

  listar(opts: { q?: string; page?: number; size?: number } = {}): Observable<PaginaUsuarios> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.page != null) params = params.set('page', opts.page);
    if (opts.size != null) params = params.set('size', opts.size);
    return this.http.get<PaginaUsuarios>(this.url, { params });
  }

  obtener(id: number): Observable<UsuarioAdmin> {
    return this.http.get<UsuarioAdmin>(`${this.url}/${id}`);
  }

  roles(): Observable<RolOpcion[]> {
    return this.http.get<RolOpcion[]>(`${this.url}/roles`);
  }

  crear(req: UsuarioRequest): Observable<void> {
    return this.http.post<void>(this.url, req);
  }

  actualizar(id: number, req: UsuarioRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  urlFoto(id: number): string {
    return `${this.url}/${id}/foto`;
  }
}
