import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaActividad } from '../models/registro-actividad.model';

@Injectable({ providedIn: 'root' })
export class RegistroActividadService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/actividad`;

  listar(opts: { q?: string; username?: string; modulo?: string; accion?: string; page?: number; size?: number } = {}): Observable<PaginaActividad> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.username) params = params.set('username', opts.username);
    if (opts.modulo) params = params.set('modulo', opts.modulo);
    if (opts.accion) params = params.set('accion', opts.accion);
    if (opts.page != null) params = params.set('page', opts.page);
    if (opts.size != null) params = params.set('size', opts.size);
    return this.http.get<PaginaActividad>(this.url, { params });
  }

  modulos(): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/modulos`);
  }

  acciones(): Observable<{ valor: string; etiqueta: string }[]> {
    return this.http.get<{ valor: string; etiqueta: string }[]>(`${this.url}/acciones`);
  }
}
