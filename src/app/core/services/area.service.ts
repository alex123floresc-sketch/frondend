import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Curso, Nivel } from '../models/curso.model';

export interface AreaResumen {
  nombre: string;
  cursos: number;
  profesores: number;
  alumnos: number;
}

@Injectable({ providedIn: 'root' })
export class AreaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/areas`;

  porNivel(): Observable<Record<Nivel, number>> {
    return this.http.get<Record<Nivel, number>>(`${this.url}/niveles`);
  }

  resumen(nivel: Nivel): Observable<AreaResumen[]> {
    return this.http.get<AreaResumen[]>(this.url, { params: new HttpParams().set('nivel', nivel) });
  }

  cursosDeArea(nivel: Nivel, area: string): Observable<Curso[]> {
    return this.http.get<Curso[]>(`${this.url}/cursos`, { params: new HttpParams().set('nivel', nivel).set('area', area) });
  }

  guardar(nivel: Nivel, area: string, cursoIds: number[]): Observable<void> {
    let params = new HttpParams().set('nivel', nivel).set('area', area);
    for (const id of cursoIds) params = params.append('cursoIds', id);
    return this.http.post<void>(this.url, null, { params });
  }
}
