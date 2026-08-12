import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AsistenciaService } from '../../core/services/asistencia.service';
import { RegistroIngreso } from '../../core/models/asistencia.model';

@Component({
  selector: 'app-asistencia-estudiantes',
  standalone: true,
  imports: [FormsModule, DatePipe, RouterLink],
  template: `
    <div class="barra-superior">
      <h2>Ingreso de estudiantes</h2>
      <a routerLink="/asistencias"><button class="btn-secundario">Volver</button></a>
    </div>

    <div class="tarjeta">
      <div class="campo">
        <label>Código / DNI del alumno</label>
        <input [(ngModel)]="codigo" (keyup.enter)="registrar()" placeholder="Escanea o escribe el código" autofocus />
      </div>
      <button (click)="registrar()">Registrar ingreso</button>
      @if (mensaje()) {
        <p [style.color]="exito() ? 'green' : 'crimson'" style="margin-top:.5rem">{{ mensaje() }}</p>
      }
    </div>

    <div class="tarjeta">
      <h3>Hoy ({{ total() }})</h3>
      <table>
        <thead><tr><th>Hora</th><th>Alumno</th><th>DNI</th></tr></thead>
        <tbody>
          @for (r of registros(); track r.id) {
            <tr><td>{{ r.horaIngreso | date:'HH:mm' }}</td><td>{{ r.alumnoNombreCompleto }}</td><td>{{ r.alumnoDni }}</td></tr>
          } @empty { <tr><td colspan="3">Sin ingresos registrados hoy.</td></tr> }
        </tbody>
      </table>
    </div>
  `
})
export class AsistenciaEstudiantesComponent implements OnInit {
  private service = inject(AsistenciaService);

  codigo = '';
  registros = signal<RegistroIngreso[]>([]);
  total = signal(0);
  mensaje = signal<string | null>(null);
  exito = signal(false);

  ngOnInit(): void {
    this.cargar();
  }

  private cargar(): void {
    this.service.ingresoHoy().subscribe((r) => {
      this.registros.set(r.registrosHoy);
      this.total.set(r.totalHoy);
    });
  }

  registrar(): void {
    if (!this.codigo.trim()) return;
    this.service.registrarIngreso(this.codigo.trim()).subscribe((res) => {
      this.exito.set(res.ok);
      this.mensaje.set(res.mensaje);
      this.codigo = '';
      if (res.ok) this.cargar();
    });
  }
}
