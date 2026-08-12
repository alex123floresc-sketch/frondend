import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlumnoService } from '../../core/services/alumno.service';
import { PagoService } from '../../core/services/pago.service';
import { AuthService } from '../../core/services/auth.service';
import { Expediente } from '../../core/models/alumno.model';

@Component({
  selector: 'app-alumno-expediente',
  standalone: true,
  imports: [RouterLink, FormsModule, DecimalPipe],
  template: `
    <div class="barra-superior">
      <h2>Expediente del alumno</h2>
      <a routerLink="/alumnos"><button class="btn-secundario">Volver</button></a>
    </div>

    @if (cargando()) {
      <p>Cargando…</p>
    } @else if (exp()) {
      <div class="tarjeta">
        <h3>{{ exp()!.alumno.nombreCompleto }}</h3>
        <p>DNI: {{ exp()!.alumno.dni }} · {{ exp()!.alumno.nivelEtiqueta }} · {{ exp()!.alumno.area }}</p>
        <p>{{ exp()!.alumno.celular ?? exp()!.alumno.email ?? 'Sin contacto registrado' }}</p>
      </div>

      <div class="tarjeta-fila">
        <div class="tarjeta stat"><span class="stat-num">{{ exp()!.matriculasActivas }}</span><span>Matrículas activas</span></div>
        <div class="tarjeta stat"><span class="stat-num">S/ {{ exp()!.totalPagado | number:'1.2-2' }}</span><span>Total pagado</span></div>
        <div class="tarjeta stat stat-alerta"><span class="stat-num">S/ {{ exp()!.totalPendiente | number:'1.2-2' }}</span><span>Saldo pendiente</span></div>
      </div>

      @for (mp of exp()!.matriculas; track mp.matricula.id) {
        <div class="tarjeta">
          <h4>{{ mp.matricula.cicloNombre }} · {{ mp.matricula.turno }} · {{ mp.matricula.estado }}</h4>
          <p>{{ mp.matricula.detalles.length }} curso(s) — {{ mp.matricula.totalHoras }} horas totales</p>
          <table>
            <thead><tr><th>Concepto</th><th>Monto</th><th>Pagado</th><th>Saldo</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              @for (p of mp.pagos; track p.id) {
                <tr>
                  <td>{{ p.concepto }}</td>
                  <td>S/ {{ p.monto | number:'1.2-2' }}</td>
                  <td>S/ {{ p.montoPagado | number:'1.2-2' }}</td>
                  <td>S/ {{ p.saldo | number:'1.2-2' }}</td>
                  <td>{{ p.fechaVencimiento }}</td>
                  <td><span class="badge" [class.badge-ok]="p.estado === 'PAGADO'" [class.badge-alerta]="p.estado === 'VENCIDO'">{{ p.estado }}</span></td>
                  <td>
                    @if (esAdminOCajero() && p.saldo > 0) {
                      <button class="btn-secundario" (click)="abrirAbono(p.id)">Abonar</button>
                    }
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="7">Sin pagos registrados.</td></tr>
              }
            </tbody>
          </table>
        </div>
      }

      @if (pagoSeleccionado(); as pid) {
        <div class="tarjeta">
          <h4>Registrar abono</h4>
          <div class="campo">
            <label>Monto</label>
            <input type="number" step="0.01" [(ngModel)]="montoAbono" />
          </div>
          <div class="campo">
            <label>Método</label>
            <select [(ngModel)]="metodoAbono">
              <option value="EFECTIVO">Efectivo</option>
              <option value="TRANSFERENCIA">Transferencia</option>
              <option value="TARJETA">Tarjeta</option>
              <option value="YAPE">Yape/Plin</option>
            </select>
          </div>
          <button (click)="registrarAbono(pid)">Confirmar abono</button>
          <button class="btn-secundario" (click)="pagoSeleccionado.set(null)">Cancelar</button>
        </div>
      }
    }
  `,
  styles: [`
    .tarjeta-fila { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .stat { display: flex; flex-direction: column; align-items: center; padding: .75rem 1.5rem; }
    .stat-num { font-size: 1.3rem; font-weight: 700; color: var(--color-secundario); }
    .stat-alerta .stat-num { color: #dc2626; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .badge-alerta { background: #fee2e2; color: #991b1b; }
  `]
})
export class AlumnoExpedienteComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(AlumnoService);
  private pagoService = inject(PagoService);
  private auth = inject(AuthService);

  exp = signal<Expediente | null>(null);
  cargando = signal(false);
  pagoSeleccionado = signal<number | null>(null);
  montoAbono: number | null = null;
  metodoAbono = 'EFECTIVO';

  esAdminOCajero = () => this.auth.tieneRol('ROLE_ADMIN', 'ROLE_CAJERO');

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargar(id);
  }

  private cargar(id: number): void {
    this.cargando.set(true);
    this.service.expediente(id).subscribe({
      next: (e) => { this.exp.set(e); this.cargando.set(false); },
      error: () => this.cargando.set(false)
    });
  }

  abrirAbono(pagoId: number): void {
    this.pagoSeleccionado.set(pagoId);
    this.montoAbono = null;
    this.metodoAbono = 'EFECTIVO';
  }

  registrarAbono(pagoId: number): void {
    if (!this.montoAbono || this.montoAbono <= 0) return;
    this.pagoService.registrarAbono(pagoId, { monto: this.montoAbono, metodo: this.metodoAbono }).subscribe(() => {
      this.pagoSeleccionado.set(null);
      const id = Number(this.route.snapshot.paramMap.get('id'));
      this.cargar(id);
    });
  }
}
