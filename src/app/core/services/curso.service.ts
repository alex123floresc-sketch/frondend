import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Curso, CursoForm, Nivel, OpcionNivel, PaginaCursos } from '../models/curso.model';

@Injectable({ providedIn: 'root' })
export class CursoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/cursos`;

  listar(opts: { q?: string; nivel?: Nivel | null; area?: string | null; page?: number; size?: number } = {}): Observable<PaginaCursos> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.nivel) params = params.set('nivel', opts.nivel);
    if (opts.area) params = params.set('area', opts.area);
    if (opts.page != null) params = params.set('page', opts.page);
    if (opts.size != null) params = params.set('size', opts.size);
    return this.http.get<PaginaCursos>(this.url, { params });
  }

  obtener(id: number): Observable<Curso> {
    return this.http.get<Curso>(`${this.url}/${id}`);
  }

  crear(form: CursoForm): Observable<void> {
    return this.http.post<void>(this.url, form);
  }

  actualizar(id: number, form: CursoForm): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, form);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  niveles(): Observable<OpcionNivel[]> {
    return this.http.get<OpcionNivel[]>(`${this.url}/niveles`);
  }

  areas(nivel: Nivel): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/areas`, { params: new HttpParams().set('nivel', nivel) });
  }
}
