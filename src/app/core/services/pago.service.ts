import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Abono, AbonoRequest, NuevaCuotaRequest, Pago } from '../models/pago.model';

export interface AlumnoConPagos {
  alumno: { id: number; nombreCompleto: string; dni: string };
  pagos: Pago[];
}

export interface PaginaPagos {
  contenido: AlumnoConPagos[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanio: number;
  cobrado: number;
  porCobrar: number;
  vencido: number;
}

export interface DetallePago {
  pago: Pago;
  abonos: Abono[];
}

@Injectable({ providedIn: 'root' })
export class PagoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/pagos`;

  listar(opts: { q?: string; page?: number; size?: number } = {}): Observable<PaginaPagos> {
    let params = new HttpParams();
    if (opts.q) params = params.set('q', opts.q);
    if (opts.page != null) params = params.set('page', opts.page);
    if (opts.size != null) params = params.set('size', opts.size);
    return this.http.get<PaginaPagos>(this.url, { params });
  }

  detalle(id: number): Observable<DetallePago> {
    return this.http.get<DetallePago>(`${this.url}/${id}`);
  }

  registrarAbono(id: number, req: AbonoRequest): Observable<Pago> {
    return this.http.post<Pago>(`${this.url}/${id}/abonos`, req);
  }

  nuevaCuota(req: NuevaCuotaRequest): Observable<Pago> {
    return this.http.post<Pago>(`${this.url}/cuotas`, req);
  }
}
