import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AsignarCursoRequest, CrearBloqueRequest, DiaSemana, GrillaHorarios } from '../models/horario.model';
import { Curso } from '../models/curso.model';

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/horarios`;

  porNivel(cicloId?: number | null): Observable<Record<string, number>> {
    let params = new HttpParams();
    if (cicloId) params = params.set('cicloId', cicloId);
    return this.http.get<Record<string, number>>(`${this.url}/niveles`, { params });
  }

  porArea(nivel: string, cicloId?: number | null): Observable<Record<string, number>> {
    let params = new HttpParams().set('nivel', nivel);
    if (cicloId) params = params.set('cicloId', cicloId);
    return this.http.get<Record<string, number>>(`${this.url}/areas`, { params });
  }

  grilla(cicloId: number, nivel: string, area: string): Observable<GrillaHorarios> {
    const params = new HttpParams().set('cicloId', cicloId).set('nivel', nivel).set('area', area);
    return this.http.get<GrillaHorarios>(`${this.url}/grilla`, { params });
  }

  crearBloque(req: CrearBloqueRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/bloques`, req);
  }

  eliminarBloque(bloqueId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/bloques/${bloqueId}`);
  }

  cursosParaAsignar(bloqueId: number, dia: DiaSemana): Observable<{ bloque: any; cursosDisponibles: Curso[]; cursoIdsAgregados: number[] }> {
    return this.http.get<any>(`${this.url}/bloques/${bloqueId}/dia/${dia}/cursos`);
  }

  asignar(req: AsignarCursoRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/asignar`, req);
  }

  quitarCurso(horarioId: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${horarioId}`);
  }
}
