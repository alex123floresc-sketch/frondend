import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alumno, AlumnoRequest, Expediente, MatricularRequest, PaginaAlumnos } from '../models/alumno.model';
import { Nivel, OpcionNivel } from '../models/curso.model';
import { Matricula } from '../models/matricula.model';

@Injectable({ providedIn: 'root' })
export class AlumnoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/alumnos`;

  listar(opts: { q?: string; nivel?: Nivel | null; area?: string | null; page?: number; size?: number } = {}): Observable<PaginaAlumnos> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.nivel) params = params.set('nivel', opts.nivel);
    if (opts.area) params = params.set('area', opts.area);
    if (opts.page != null) params = params.set('page', opts.page);
    if (opts.size != null) params = params.set('size', opts.size);
    return this.http.get<PaginaAlumnos>(this.url, { params });
  }

  obtener(id: number): Observable<Alumno> {
    return this.http.get<Alumno>(`${this.url}/${id}`);
  }

  crear(req: AlumnoRequest): Observable<Alumno> {
    return this.http.post<Alumno>(this.url, req);
  }

  actualizar(id: number, req: AlumnoRequest): Observable<Alumno> {
    return this.http.put<Alumno>(`${this.url}/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  subirFoto(id: number, archivo: File): Observable<Alumno> {
    const datos = new FormData();
    datos.append('foto', archivo);
    return this.http.post<Alumno>(`${this.url}/${id}/foto`, datos);
  }

  urlFoto(id: number): string {
    return `${this.url}/${id}/foto`;
  }

  niveles(): Observable<OpcionNivel[]> {
    return this.http.get<OpcionNivel[]>(`${this.url}/niveles`);
  }

  areas(nivel: Nivel): Observable<string[]> {
    return this.http.get<string[]>(`${this.url}/areas`, { params: new HttpParams().set('nivel', nivel) });
  }

  matricular(id: number, req: MatricularRequest): Observable<Matricula> {
    return this.http.post<Matricula>(`${this.url}/${id}/matricular`, req);
  }

  expediente(id: number): Observable<Expediente> {
    return this.http.get<Expediente>(`${this.url}/${id}/expediente`);
  }
}
