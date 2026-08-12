import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RegistroActividadService } from '../../core/services/registro-actividad.service';
import { RegistroActividad } from '../../core/models/registro-actividad.model';

@Component({
  selector: 'app-actividad-lista',
  standalone: true,
  imports: [FormsModule, DatePipe],
  template: `
    <div class="barra-superior"><h2>Historial de actividad</h2></div>

    <div class="tarjeta-fila">
      <div class="tarjeta stat"><span class="stat-num">{{ totalHoy() }}</span><span>Hoy</span></div>
      <div class="tarjeta stat"><span class="stat-num">{{ totalSemana() }}</span><span>Últimos 7 días</span></div>
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Buscar</label>
        <input [(ngModel)]="q" (keyup.enter)="cargar(0)" placeholder="Descripción o usuario" />
      </div>
      <div class="campo">
        <label>Módulo</label>
        <select [(ngModel)]="modulo" (ngModelChange)="cargar(0)">
          <option [ngValue]="null">Todos</option>
          @for (m of modulos(); track m) { <option [ngValue]="m">{{ m }}</option> }
        </select>
      </div>
      <div class="campo">
        <label>Acción</label>
        <select [(ngModel)]="accion" (ngModelChange)="cargar(0)">
          <option [ngValue]="null">Todas</option>
          @for (a of acciones(); track a.valor) { <option [ngValue]="a.valor">{{ a.etiqueta }}</option> }
        </select>
      </div>
      <button (click)="cargar(0)">Filtrar</button>
    </div>

    @if (cargando()) {
      <p>Cargando…</p>
    } @else {
      <table>
        <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Módulo</th><th>Descripción</th></tr></thead>
        <tbody>
          @for (r of registros(); track r.id) {
            <tr>
              <td>{{ r.fecha | date:'dd/MM/yyyy HH:mm' }}</td>
              <td>{{ r.username }}</td>
              <td><span class="badge badge-nivel">{{ r.accionEtiqueta }}</span></td>
              <td>{{ r.modulo }}</td>
              <td>{{ r.descripcion }}</td>
            </tr>
          } @empty {
            <tr><td colspan="5">No hay registros que coincidan.</td></tr>
          }
        </tbody>
      </table>

      @if (totalPaginas() > 1) {
        <div class="paginacion">
          <button class="btn-secundario" [disabled]="pagina() === 0" (click)="cargar(pagina() - 1)">Anterior</button>
          <span>Página {{ pagina() + 1 }} de {{ totalPaginas() }}</span>
          <button class="btn-secundario" [disabled]="pagina() + 1 >= totalPaginas()" (click)="cargar(pagina() + 1)">Siguiente</button>
        </div>
      }
    }
  `,
  styles: [`
    .tarjeta-fila { display: flex; gap: 1rem; margin-bottom: 1rem; }
    .stat { display: flex; flex-direction: column; align-items: center; padding: .75rem 1.5rem; }
    .stat-num { font-size: 1.3rem; font-weight: 700; color: var(--color-secundario); }
    .paginacion { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1rem; }
  `]
})
export class ActividadListaComponent implements OnInit {
  private service = inject(RegistroActividadService);

  registros = signal<RegistroActividad[]>([]);
  modulos = signal<string[]>([]);
  acciones = signal<{ valor: string; etiqueta: string }[]>([]);
  cargando = signal(false);
  pagina = signal(0);
  totalPaginas = signal(0);
  totalHoy = signal(0);
  totalSemana = signal(0);

  q = '';
  modulo: string | null = null;
  accion: string | null = null;

  ngOnInit(): void {
    this.service.modulos().subscribe((m) => this.modulos.set(m));
    this.service.acciones().subscribe((a) => this.acciones.set(a));
    this.cargar(0);
  }

  cargar(pagina: number): void {
    this.cargando.set(true);
    this.service.listar({
      q: this.q, modulo: this.modulo ?? undefined, accion: this.accion ?? undefined, page: pagina, size: 20
    }).subscribe({
      next: (p) => {
        this.registros.set(p.contenido);
        this.pagina.set(p.paginaActual);
        this.totalPaginas.set(p.totalPaginas);
        this.totalHoy.set(p.totalHoy);
        this.totalSemana.set(p.totalSemana);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }
}
