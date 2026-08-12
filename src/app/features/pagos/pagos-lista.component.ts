import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PagoService } from '../../core/services/pago.service';
import { AlumnoConPagos } from '../../core/services/pago.service';

@Component({
  selector: 'app-pagos-lista',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  template: `
    <div class="barra-superior">
      <h2>Pagos</h2>
    </div>

    <div class="tarjeta-fila">
      <div class="tarjeta stat"><span class="stat-num">S/ {{ cobrado() | number:'1.2-2' }}</span><span>Cobrado</span></div>
      <div class="tarjeta stat"><span class="stat-num">S/ {{ porCobrar() | number:'1.2-2' }}</span><span>Por cobrar</span></div>
      <div class="tarjeta stat stat-alerta"><span class="stat-num">S/ {{ vencido() | number:'1.2-2' }}</span><span>Vencido</span></div>
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Buscar</label>
        <input [(ngModel)]="q" (keyup.enter)="cargar(0)" placeholder="Alumno o concepto" />
      </div>
      <button (click)="cargar(0)">Filtrar</button>
    </div>

    @if (cargando()) {
      <p>Cargando pagos…</p>
    } @else {
      @for (fila of alumnos(); track fila.alumno.id) {
        <div class="tarjeta">
          <h4>{{ fila.alumno.nombreCompleto }} — DNI {{ fila.alumno.dni }}</h4>
          <table>
            <thead><tr><th>Concepto</th><th>Monto</th><th>Saldo</th><th>Vence</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              @for (p of fila.pagos; track p.id) {
                <tr>
                  <td>{{ p.concepto }}</td>
                  <td>S/ {{ p.monto | number:'1.2-2' }}</td>
                  <td>S/ {{ p.saldo | number:'1.2-2' }}</td>
                  <td>{{ p.fechaVencimiento }}</td>
                  <td><span class="badge" [class.badge-ok]="p.estado === 'PAGADO'" [class.badge-alerta]="p.estado === 'VENCIDO'">{{ p.estado }}</span></td>
                  <td>
                    @if (p.saldo > 0) { <button class="btn-secundario" (click)="abrirAbono(p.id)">Abonar</button> }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @empty {
        <p>No hay alumnos con pagos que coincidan.</p>
      }

      @if (totalPaginas() > 1) {
        <div class="paginacion">
          <button class="btn-secundario" [disabled]="pagina() === 0" (click)="cargar(pagina() - 1)">Anterior</button>
          <span>Página {{ pagina() + 1 }} de {{ totalPaginas() }}</span>
          <button class="btn-secundario" [disabled]="pagina() + 1 >= totalPaginas()" (click)="cargar(pagina() + 1)">Siguiente</button>
        </div>
      }
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
  `,
  styles: [`
    .tarjeta-fila { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .stat { display: flex; flex-direction: column; align-items: center; padding: .75rem 1.5rem; }
    .stat-num { font-size: 1.3rem; font-weight: 700; color: var(--color-secundario); }
    .stat-alerta .stat-num { color: #dc2626; }
    .badge-ok { background: #dcfce7; color: #166534; }
    .badge-alerta { background: #fee2e2; color: #991b1b; }
    .paginacion { display: flex; gap: 1rem; align-items: center; justify-content: center; margin: 1rem 0; }
  `]
})
export class PagosListaComponent implements OnInit {
  private service = inject(PagoService);

  alumnos = signal<AlumnoConPagos[]>([]);
  cargando = signal(false);
  pagina = signal(0);
  totalPaginas = signal(0);
  cobrado = signal(0);
  porCobrar = signal(0);
  vencido = signal(0);
  q = '';

  pagoSeleccionado = signal<number | null>(null);
  montoAbono: number | null = null;
  metodoAbono = 'EFECTIVO';

  ngOnInit(): void {
    this.cargar(0);
  }

  cargar(pagina: number): void {
    this.cargando.set(true);
    this.service.listar({ q: this.q, page: pagina, size: 10 }).subscribe({
      next: (p) => {
        this.alumnos.set(p.contenido);
        this.pagina.set(p.paginaActual);
        this.totalPaginas.set(p.totalPaginas);
        this.cobrado.set(p.cobrado);
        this.porCobrar.set(p.porCobrar);
        this.vencido.set(p.vencido);
        this.cargando.set(false);
      },
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
    this.service.registrarAbono(pagoId, { monto: this.montoAbono, metodo: this.metodoAbono }).subscribe(() => {
      this.pagoSeleccionado.set(null);
      this.cargar(this.pagina());
    });
  }
}
