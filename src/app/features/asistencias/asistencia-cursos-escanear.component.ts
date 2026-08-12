import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { AsistenciaRegistro, HorarioAsignacion } from '../../core/models/asistencia.model';

@Component({
  selector: 'app-asistencia-cursos-escanear',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>Registrar asistencia</h2>
      <a routerLink="/asistencias/cursos"><button class="btn-secundario">Volver</button></a>
    </div>

    @if (horario(); as h) {
      <p><strong>{{ h.cursoCodigo }} — {{ h.cursoNombre }}</strong> · {{ h.profesorNombre ?? 'Sin profesor' }} · {{ h.diaSemana }}</p>
    }

    <div class="tarjeta">
      <div class="campo">
        <label>Código / DNI del alumno</label>
        <input [(ngModel)]="codigo" (keyup.enter)="registrar()" placeholder="Escanea o escribe el código" autofocus />
      </div>
      <button (click)="registrar()">Registrar asistencia</button>
      @if (mensaje()) {
        <p [style.color]="exito() ? 'green' : 'crimson'" style="margin-top:.5rem">{{ mensaje() }}</p>
      }
    </div>

    <div class="tarjeta">
      <h3>Registrados hoy ({{ registros().length }})</h3>
      <table>
        <thead><tr><th>Hora</th><th>Alumno</th><th>DNI</th></tr></thead>
        <tbody>
          @for (r of registros(); track r.id) {
            <tr><td>{{ r.horaRegistro | date:'HH:mm' }}</td><td>{{ r.alumnoNombreCompleto }}</td><td>{{ r.alumnoDni }}</td></tr>
          } @empty { <tr><td colspan="3">Sin asistencias registradas.</td></tr> }
        </tbody>
      </table>
    </div>
  `
})
export class AsistenciaCursosEscanearComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(AsistenciaService);

  horarioId!: number;
  horario = signal<HorarioAsignacion | null>(null);
  registros = signal<AsistenciaRegistro[]>([]);
  codigo = '';
  mensaje = signal<string | null>(null);
  exito = signal(false);

  ngOnInit(): void {
    this.horarioId = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar();
  }

  private cargar(): void {
    this.service.cursoEscanear(this.horarioId).subscribe((r) => {
      this.horario.set(r.horario);
      this.registros.set(r.registrosHoy);
    });
  }

  registrar(): void {
    if (!this.codigo.trim()) return;
    this.service.registrarAsistenciaCurso(this.horarioId, this.codigo.trim()).subscribe((res) => {
      this.exito.set(res.ok);
      this.mensaje.set(res.mensaje);
      this.codigo = '';
      if (res.ok) this.cargar();
    });
  }
}
