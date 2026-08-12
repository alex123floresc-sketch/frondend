import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Perfil, PerfilRequest } from '../models/perfil.model';

@Injectable({ providedIn: 'root' })
export class PerfilService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/perfil`;

  obtener(): Observable<Perfil> {
    return this.http.get<Perfil>(this.url);
  }

  actualizar(req: PerfilRequest): Observable<Perfil> {
    return this.http.put<Perfil>(this.url, req);
  }

  subirFoto(archivo: File): Observable<void> {
    const datos = new FormData();
    datos.append('foto', archivo);
    return this.http.post<void>(`${this.url}/foto`, datos);
  }

  quitarFoto(): Observable<void> {
    return this.http.delete<void>(`${this.url}/foto`);
  }

  subirFirma(archivo: File): Observable<void> {
    const datos = new FormData();
    datos.append('firma', archivo);
    return this.http.post<void>(`${this.url}/firma`, datos);
  }

  urlFoto(): string {
    return `${this.url}/foto`;
  }

  urlFirma(): string {
    return `${this.url}/firma`;
  }
}
