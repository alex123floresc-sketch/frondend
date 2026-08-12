import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { CicloService } from '../../core/services/ciclo.service';
import { DIAS } from '../../core/models/horario.model';
import { HorarioAsignacion } from '../../core/models/asistencia.model';
import { Ciclo } from '../../core/models/ciclo.model';

@Component({
  selector: 'app-asistencia-cursos-lista',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>Asistencia por curso</h2>
      <a routerLink="/asistencias"><button class="btn-secundario">Volver</button></a>
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Ciclo</label>
        <select [(ngModel)]="cicloId" (ngModelChange)="cargar()">
          @for (c of ciclos(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }
        </select>
      </div>
      <div class="campo">
        <label>Turno</label>
        <select [(ngModel)]="turno" (ngModelChange)="cargar()">
          <option value="MANANA">Mañana</option><option value="TARDE">Tarde</option><option value="NOCHE">Noche</option>
        </select>
      </div>
      <div class="campo">
        <label>Día</label>
        <select [(ngModel)]="dia" (ngModelChange)="cargar()">
          @for (d of dias; track d.valor) { <option [value]="d.valor">{{ d.etiqueta }}</option> }
        </select>
      </div>
    </div>

    <table>
      <thead><tr><th>Curso</th><th>Profesor</th><th>Aula</th><th>Asistencias hoy</th><th></th></tr></thead>
      <tbody>
        @for (h of horarios(); track h.id) {
          <tr>
            <td>{{ h.cursoCodigo }} — {{ h.cursoNombre }}</td>
            <td>{{ h.profesorNombre ?? '—' }}</td>
            <td>{{ h.aula ?? '—' }}</td>
            <td>{{ conteos()[h.id] ?? 0 }}</td>
            <td><a [routerLink]="['/asistencias/cursos', h.id]"><button class="btn-secundario">Escanear</button></a></td>
          </tr>
        } @empty { <tr><td colspan="5">No hay cursos en ese ciclo/turno/día.</td></tr> }
      </tbody>
    </table>
  `
})
export class AsistenciaCursosListaComponent implements OnInit {
  private service = inject(AsistenciaService);
  private cicloService = inject(CicloService);

  ciclos = signal<Ciclo[]>([]);
  cicloId: number | null = null;
  turno = 'MANANA';
  dia = 'LUNES';
  dias = DIAS;

  horarios = signal<HorarioAsignacion[]>([]);
  conteos = signal<Record<string, number>>({});

  ngOnInit(): void {
    this.cicloService.todos().subscribe((c) => {
      this.ciclos.set(c);
      const activo = c.find((x) => x.activo);
      this.cicloId = activo ? activo.id : (c[0]?.id ?? null);
      this.cargar();
    });
  }

  cargar(): void {
    this.service.cursosLista(this.cicloId, this.turno, this.dia).subscribe((r) => {
      this.turno = r.turnoSel;
      if (r.diaSel) this.dia = r.diaSel;
      this.horarios.set(r.horarios);
      this.conteos.set(r.conteos);
    });
  }
}
