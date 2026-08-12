import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AsistenciaRegistro, AsistenciaResultado, HorarioAsignacion, RegistroHoras, RegistroIngreso } from '../models/asistencia.model';

@Injectable({ providedIn: 'root' })
export class AsistenciaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/asistencias`;

  ingresoHoy(): Observable<{ registrosHoy: RegistroIngreso[]; totalHoy: number }> {
    return this.http.get<{ registrosHoy: RegistroIngreso[]; totalHoy: number }>(`${this.url}/estudiantes`);
  }

  registrarIngreso(codigo: string): Observable<AsistenciaResultado> {
    return this.http.post<AsistenciaResultado>(`${this.url}/estudiantes/registrar`, { codigo });
  }

  docentesHoy(turno?: string): Observable<{
    ciclo: string | null; diaHoy: string | null; turnoSel: string;
    horarios: HorarioAsignacion[]; registrosHoy: Record<string, RegistroHoras>;
  }> {
    let params = new HttpParams();
    if (turno) params = params.set('turno', turno);
    return this.http.get<any>(`${this.url}/docentes`, { params });
  }

  marcarLlegadaDocente(horarioId: number): Observable<void> {
    return this.http.post<void>(`${this.url}/docentes/marcar`, null, { params: new HttpParams().set('horarioId', horarioId) });
  }

  cursosLista(cicloId?: number | null, turno?: string, dia?: string): Observable<{
    cicloSel: number | null; turnoSel: string; diaSel: string | null;
    horarios: HorarioAsignacion[]; conteos: Record<string, number>;
  }> {
    let params = new HttpParams();
    if (cicloId) params = params.set('cicloId', cicloId);
    if (turno) params = params.set('turno', turno);
    if (dia) params = params.set('dia', dia);
    return this.http.get<any>(`${this.url}/cursos`, { params });
  }

  cursoEscanear(horarioId: number): Observable<{ horario: HorarioAsignacion; registrosHoy: AsistenciaRegistro[] }> {
    return this.http.get<any>(`${this.url}/cursos/${horarioId}`);
  }

  registrarAsistenciaCurso(horarioId: number, codigo: string): Observable<AsistenciaResultado> {
    return this.http.post<AsistenciaResultado>(`${this.url}/cursos/registrar`, { horarioId, codigo });
  }
}
