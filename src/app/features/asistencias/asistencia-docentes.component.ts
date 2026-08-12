import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { HorarioAsignacion, RegistroHoras } from '../../core/models/asistencia.model';

@Component({
  selector: 'app-asistencia-docentes',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>Llegada de docentes</h2>
      <a routerLink="/asistencias"><button class="btn-secundario">Volver</button></a>
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Turno</label>
        <select [(ngModel)]="turno" (ngModelChange)="cargar()">
          <option value="MANANA">Mañana</option>
          <option value="TARDE">Tarde</option>
          <option value="NOCHE">Noche</option>
        </select>
      </div>
    </div>

    <p>{{ ciclo() }} · {{ diaHoy() }}</p>

    <table>
      <thead><tr><th>Hora</th><th>Curso</th><th>Profesor</th><th>Estado</th><th></th></tr></thead>
      <tbody>
        @for (h of horarios(); track h.id) {
          <tr>
            <td>{{ h.diaSemana }}</td>
            <td>{{ h.cursoCodigo }} — {{ h.cursoNombre }}</td>
            <td>{{ h.profesorNombre ?? '—' }}</td>
            <td>
              @if (registros()[h.id]) {
                <span class="badge badge-ok">Llegó {{ registros()[h.id].horaLlegada?.substring(11,16) }}</span>
              } @else {
                <span class="badge">Pendiente</span>
              }
            </td>
            <td>
              @if (!registros()[h.id]) {
                <button class="btn-secundario" (click)="marcar(h.id)">Marcar llegada</button>
              }
            </td>
          </tr>
        } @empty { <tr><td colspan="5">No hay clases programadas en este turno hoy.</td></tr> }
      </tbody>
    </table>
  `,
  styles: [`.badge-ok { background: #dcfce7; color: #166534; }`]
})
export class AsistenciaDocentesComponent implements OnInit {
  private service = inject(AsistenciaService);

  turno = 'MANANA';
  ciclo = signal<string | null>(null);
  diaHoy = signal<string | null>(null);
  horarios = signal<HorarioAsignacion[]>([]);
  registros = signal<Record<string, RegistroHoras>>({});

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.service.docentesHoy(this.turno).subscribe((r) => {
      this.ciclo.set(r.ciclo);
      this.diaHoy.set(r.diaHoy);
      this.turno = r.turnoSel;
      this.horarios.set(r.horarios);
      this.registros.set(r.registrosHoy);
    });
  }

  marcar(horarioId: number): void {
    this.service.marcarLlegadaDocente(horarioId).subscribe(() => this.cargar());
  }
}
