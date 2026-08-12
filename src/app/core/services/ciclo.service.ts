import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Ciclo, CicloForm, PaginaCiclos } from '../models/ciclo.model';

@Injectable({ providedIn: 'root' })
export class CicloService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/ciclos`;

  listar(opts: { q?: string; page?: number; size?: number } = {}): Observable<PaginaCiclos> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.page != null) params = params.set('page', opts.page);
    if (opts.size != null) params = params.set('size', opts.size);
    return this.http.get<PaginaCiclos>(this.url, { params });
  }

  todos(): Observable<Ciclo[]> {
    return this.http.get<Ciclo[]>(`${this.url}/todos`);
  }

  activo(): Observable<Ciclo | null> {
    return this.http.get<Ciclo>(`${this.url}/activo`);
  }

  obtener(id: number): Observable<Ciclo> {
    return this.http.get<Ciclo>(`${this.url}/${id}`);
  }

  crear(form: CicloForm): Observable<void> {
    return this.http.post<void>(this.url, form);
  }

  actualizar(id: number, form: CicloForm): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, form);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
