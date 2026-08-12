import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PaginaProfesores, Profesor, ProfesorRequest } from '../models/profesor.model';

export interface DetalleProfesor {
  profesor: Profesor;
  cursos: { id: number; nombre: string }[];
  totalHorarios: number;
  rangoInicio: string;
  rangoFin: string;
  horasQuincena: number;
  montoEsperadoQuincena: number;
  montoPagadoQuincena: number;
  pendienteQuincena: number;
  ultimosPagos: any[];
}

@Injectable({ providedIn: 'root' })
export class ProfesorService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/profesores`;

  listar(opts: { q?: string; page?: number; size?: number } = {}): Observable<PaginaProfesores> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.page != null) params = params.set('page', opts.page);
    if (opts.size != null) params = params.set('size', opts.size);
    return this.http.get<PaginaProfesores>(this.url, { params });
  }

  obtener(id: number): Observable<Profesor> {
    return this.detalle(id).pipe(map((d) => d.profesor));
  }

  detalle(id: number): Observable<DetalleProfesor> {
    return this.http.get<DetalleProfesor>(`${this.url}/${id}`);
  }

  crear(req: ProfesorRequest): Observable<void> {
    return this.http.post<void>(this.url, req);
  }

  actualizar(id: number, req: ProfesorRequest): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  subirFoto(id: number, archivo: File): Observable<void> {
    const datos = new FormData();
    datos.append('foto', archivo);
    return this.http.post<void>(`${this.url}/${id}/foto`, datos);
  }

  urlFoto(id: number): string {
    return `${this.url}/${id}/foto`;
  }
}
