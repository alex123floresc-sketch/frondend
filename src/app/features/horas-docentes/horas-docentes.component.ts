import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HorasDocenteService, DetalleHorasDocente } from '../../core/services/horas-docente.service';
import { ProfesorService } from '../../core/services/profesor.service';
import { AuthService } from '../../core/services/auth.service';
import { Profesor } from '../../core/models/profesor.model';

@Component({
  selector: 'app-horas-docentes',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="barra-superior"><h2>Horas docentes</h2></div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Profesor</label>
        <select [(ngModel)]="profesorId" (ngModelChange)="cargar()">
          <option [ngValue]="null">Selecciona…</option>
          @for (p of profesores(); track p.id) { <option [ngValue]="p.id">{{ p.nombreCompleto }}</option> }
        </select>
      </div>
    </div>

    @if (detalle(); as d) {
      <div class="tarjeta-fila">
        <div class="tarjeta stat"><span class="stat-num">{{ d.horasSemana | number:'1.1-1' }}</span><span>Horas esta semana</span></div>
        <div class="tarjeta stat"><span class="stat-num">S/ {{ d.montoEsperadoSemana | number:'1.2-2' }}</span><span>Esperado semana</span></div>
        <div class="tarjeta stat stat-alerta"><span class="stat-num">S/ {{ d.pendienteSemana | number:'1.2-2' }}</span><span>Pendiente semana</span></div>
        <div class="tarjeta stat stat-alerta"><span class="stat-num">S/ {{ d.pendienteQuincena | number:'1.2-2' }}</span><span>Pendiente quincena</span></div>
      </div>

      <div class="tarjeta">
        <h4>Horarios del profesor</h4>
        <table>
          <thead><tr><th>Día</th><th>Curso</th><th>Llegada hoy</th><th></th></tr></thead>
          <tbody>
            @for (h of d.horarios; track h.id) {
              <tr>
                <td>{{ h.diaSemana }}</td>
                <td>{{ h.cursoCodigo }} — {{ h.cursoNombre }}</td>
                <td>
                  @if (d.registrosHoyPorHorario[h.id]) { <span class="badge badge-ok">Registrado</span> }
                  @else { <span class="badge">Sin registrar</span> }
                </td>
                <td class="acciones">
                  <button class="btn-secundario" (click)="abrirRegistrar(h.id)">Registrar horas</button>
                </td>
              </tr>
            } @empty { <tr><td colspan="4">Sin horarios asignados.</td></tr> }
          </tbody>
        </table>
      </div>

      @if (registrando(); as horarioId) {
        <div class="tarjeta">
          <h4>Registrar horas</h4>
          <div class="campo"><label>Fecha</label><input type="date" [(ngModel)]="fechaRegistro" /></div>
          <div class="campo"><label>Hora inicio</label><input type="time" [(ngModel)]="horaInicioRegistro" /></div>
          <div class="campo"><label>Hora fin</label><input type="time" [(ngModel)]="horaFinRegistro" /></div>
          <div class="campo"><label>Observaciones</label><input [(ngModel)]="observacionesRegistro" /></div>
          <button (click)="guardarRegistro(horarioId)">Guardar</button>
          <button class="btn-secundario" (click)="registrando.set(null)">Cancelar</button>
        </div>
      }

      @if (esAdminOCajero()) {
        <div class="tarjeta">
          <h4>Registrar pago al profesor</h4>
          <div class="campo"><label>Tipo</label>
            <select [(ngModel)]="pagoTipo"><option value="SEMANAL">Semanal</option><option value="QUINCENAL">Quincenal</option></select>
          </div>
          <div class="campo"><label>Inicio del período</label><input type="date" [(ngModel)]="pagoInicio" /></div>
          <div class="campo"><label>Fin del período</label><input type="date" [(ngModel)]="pagoFin" /></div>
          <div class="campo"><label>Horas pagadas</label><input type="number" step="0.1" [(ngModel)]="pagoHoras" /></div>
          <div class="campo"><label>Monto</label><input type="number" step="0.01" [(ngModel)]="pagoMonto" /></div>
          <button (click)="registrarPago()">Registrar pago</button>
        </div>

        <div class="tarjeta">
          <h4>Pagos registrados</h4>
          <table>
            <thead><tr><th>Tipo</th><th>Período</th><th>Horas</th><th>Monto</th><th>Fecha</th></tr></thead>
            <tbody>
              @for (p of d.pagos; track p.id) {
                <tr><td>{{ p.tipoPeriodo }}</td><td>{{ p.periodoInicio }} – {{ p.periodoFin }}</td><td>{{ p.horasPagadas }}</td><td>S/ {{ p.monto | number:'1.2-2' }}</td><td>{{ p.fechaPago }}</td></tr>
              } @empty { <tr><td colspan="5">Sin pagos registrados.</td></tr> }
            </tbody>
          </table>
        </div>
      }
    }
  `,
  styles: [`
    .tarjeta-fila { display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap; }
    .stat { display: flex; flex-direction: column; align-items: center; padding: .75rem 1.25rem; }
    .stat-num { font-size: 1.2rem; font-weight: 700; color: var(--color-secundario); }
    .stat-alerta .stat-num { color: #dc2626; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .acciones { display: flex; gap: .4rem; }
  `]
})
export class HorasDocentesComponent implements OnInit {
  private service = inject(HorasDocenteService);
  private profesorService = inject(ProfesorService);
  private auth = inject(AuthService);

  profesores = signal<Profesor[]>([]);
  profesorId: number | null = null;
  detalle = signal<DetalleHorasDocente | null>(null);

  registrando = signal<number | null>(null);
  fechaRegistro = new Date().toISOString().substring(0, 10);
  horaInicioRegistro = '';
  horaFinRegistro = '';
  observacionesRegistro = '';

  pagoTipo: 'SEMANAL' | 'QUINCENAL' = 'SEMANAL';
  pagoInicio = '';
  pagoFin = '';
  pagoHoras: number | null = null;
  pagoMonto: number | null = null;

  esAdminOCajero = () => this.auth.tieneRol('ROLE_ADMIN', 'ROLE_CAJERO');

  ngOnInit(): void {
    this.profesorService.listar({ size: 200 }).subscribe((p) => this.profesores.set(p.contenido));
  }

  cargar(): void {
    if (!this.profesorId) return;
    this.service.ver(this.profesorId).subscribe((d) => this.detalle.set(d));
  }

  abrirRegistrar(horarioId: number): void {
    this.registrando.set(horarioId);
    this.horaInicioRegistro = '';
    this.horaFinRegistro = '';
    this.observacionesRegistro = '';
  }

  guardarRegistro(horarioId: number): void {
    if (!this.horaInicioRegistro || !this.horaFinRegistro) return;
    this.service.registrarHoras({
      horarioId, fecha: this.fechaRegistro, horaInicio: this.horaInicioRegistro,
      horaFin: this.horaFinRegistro, observaciones: this.observacionesRegistro || null
    }).subscribe(() => {
      this.registrando.set(null);
      this.cargar();
    });
  }

  registrarPago(): void {
    if (!this.profesorId || !this.pagoInicio || !this.pagoFin || !this.pagoHoras || !this.pagoMonto) return;
    this.service.registrarPago({
      profesorId: this.profesorId, tipoPeriodo: this.pagoTipo, periodoInicio: this.pagoInicio,
      periodoFin: this.pagoFin, horasPagadas: this.pagoHoras, monto: this.pagoMonto
    }).subscribe(() => {
      this.pagoHoras = null;
      this.pagoMonto = null;
      this.cargar();
    });
  }
}
