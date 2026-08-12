import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Alumno } from '../models/alumno.model';
import { Profesor } from '../models/profesor.model';
import { Curso } from '../models/curso.model';

export interface ResultadoBusqueda {
  alumnos: Alumno[];
  profesores: Profesor[];
  cursos: Curso[];
}

@Injectable({ providedIn: 'root' })
export class BusquedaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/busqueda`;

  buscar(q: string): Observable<ResultadoBusqueda> {
    return this.http.get<ResultadoBusqueda>(this.url, { params: new HttpParams().set('q', q) });
  }
}
