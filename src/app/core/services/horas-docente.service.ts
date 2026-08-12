import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HorarioAsignacion, RegistroHoras } from '../models/asistencia.model';

export interface DetalleHorasDocente {
  horarios: HorarioAsignacion[];
  registrosHoyPorHorario: Record<string, RegistroHoras>;
  rangoSemana: { inicio: string; fin: string };
  rangoQuincena: { inicio: string; fin: string };
  registrosSemana: RegistroHoras[];
  registrosQuincena: RegistroHoras[];
  horasSemana: number;
  horasQuincena: number;
  montoEsperadoSemana: number;
  montoEsperadoQuincena: number;
  montoPagadoSemana: number;
  montoPagadoQuincena: number;
  pendienteSemana: number;
  pendienteQuincena: number;
  pagos: any[];
}

export interface RegistrarHorasRequest {
  horarioId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  observaciones?: string | null;
}

export interface RegistrarPagoRequest {
  profesorId: number;
  tipoPeriodo: 'SEMANAL' | 'QUINCENAL';
  periodoInicio: string;
  periodoFin: string;
  horasPagadas: number;
  monto: number;
  fechaPago?: string | null;
  metodo?: string | null;
  observaciones?: string | null;
}

@Injectable({ providedIn: 'root' })
export class HorasDocenteService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/horas-docentes`;

  ver(profesorId: number, semana?: string, quincena?: string): Observable<DetalleHorasDocente> {
    let params = new HttpParams();
    if (semana) params = params.set('semana', semana);
    if (quincena) params = params.set('quincena', quincena);
    return this.http.get<DetalleHorasDocente>(`${this.url}/${profesorId}`, { params });
  }

  marcarLlegada(horarioId: number): Observable<void> {
    return this.http.post<void>(`${this.url}/llegada`, null, { params: new HttpParams().set('horarioId', horarioId) });
  }

  registrarHoras(req: RegistrarHorasRequest): Observable<RegistroHoras> {
    return this.http.post<RegistroHoras>(`${this.url}/registrar`, req);
  }

  registrarPago(req: RegistrarPagoRequest): Observable<any> {
    return this.http.post<any>(`${this.url}/pagos`, req);
  }
}
