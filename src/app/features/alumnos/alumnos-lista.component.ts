import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AlumnoService } from '../../core/services/alumno.service';
import { AuthService } from '../../core/services/auth.service';
import { Alumno } from '../../core/models/alumno.model';
import { Nivel, OpcionNivel } from '../../core/models/curso.model';

@Component({
  selector: 'app-alumnos-lista',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="barra-superior">
      <h2>Alumnos</h2>
      <a routerLink="/alumnos/nuevo"><button>+ Nuevo alumno</button></a>
    </div>

    <div class="tarjeta-fila">
      <div class="tarjeta stat"><span class="stat-num">{{ totalAlumnos() }}</span><span>Alumnos ({{ nivelEtiqueta() }})</span></div>
      <div class="tarjeta stat"><span class="stat-num">{{ totalAlDia() }}</span><span>Al día</span></div>
      <div class="tarjeta stat stat-alerta"><span class="stat-num">{{ totalConDeuda() }}</span><span>Con deuda</span></div>
    </div>

    <div class="tabs-nivel">
      @for (n of niveles(); track n.valor) {
        <button class="tab" [class.activo]="nivel === n.valor" (click)="cambiarNivel(n.valor)">{{ n.etiqueta }}</button>
      }
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Buscar</label>
        <input [(ngModel)]="q" (keyup.enter)="cargar(0)" placeholder="Nombre, apellido o DNI" />
      </div>
      <div class="campo">
        <label>Área / grado</label>
        <select [(ngModel)]="area" (ngModelChange)="cargar(0)">
          <option [ngValue]="null">Todas</option>
          @for (a of areas(); track a) {
            <option [ngValue]="a">{{ a }}</option>
          }
        </select>
      </div>
      <button (click)="cargar(0)">Filtrar</button>
    </div>

    @if (cargando()) {
      <p>Cargando alumnos…</p>
    } @else {
      <table>
        <thead>
          <tr><th>DNI</th><th>Nombre</th><th>Área/Grado</th><th>Contacto</th><th>Estado</th><th></th></tr>
        </thead>
        <tbody>
          @for (a of alumnos(); track a.id) {
            <tr>
              <td>{{ a.dni }}</td>
              <td>{{ a.nombreCompleto }}</td>
              <td>{{ a.area }}</td>
              <td>{{ a.celular ?? a.email ?? '—' }}</td>
              <td>
                @if (deuda()[a.id]) {
                  <span class="badge badge-alerta">Con deuda</span>
                } @else {
                  <span class="badge badge-ok">Al día</span>
                }
              </td>
              <td class="acciones">
                <a [routerLink]="['/alumnos', a.id, 'expediente']"><button class="btn-secundario">Expediente</button></a>
                @if (esAdminOCajero()) {
                  <a [routerLink]="['/alumnos/editar', a.id]"><button class="btn-secundario">Editar</button></a>
                  <button class="btn-peligro" (click)="eliminar(a)">Eliminar</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6">No hay alumnos que coincidan.</td></tr>
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
    .stat-num { font-size: 1.5rem; font-weight: 700; color: var(--color-secundario); }
    .stat-alerta .stat-num { color: #dc2626; }
    .tabs-nivel { display: flex; gap: .5rem; margin-bottom: 1rem; }
    .tab { background: #fff; border: 1px solid var(--color-borde); border-radius: .4rem; padding: .4rem .9rem; cursor: pointer; }
    .tab.activo { background: var(--color-primario); color: #fff; border-color: var(--color-primario); }
    .badge-ok { background: #dcfce7; color: #166534; }
    .badge-alerta { background: #fee2e2; color: #991b1b; }
    .acciones { display: flex; gap: .4rem; flex-wrap: wrap; }
    .paginacion { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1rem; }
  `]
})
export class AlumnosListaComponent implements OnInit {
  private service = inject(AlumnoService);
  private auth = inject(AuthService);

  alumnos = signal<Alumno[]>([]);
  niveles = signal<OpcionNivel[]>([]);
  areasDisponibles = signal<string[]>([]);
  deuda = signal<Record<number, boolean>>({});
  cargando = signal(false);
  pagina = signal(0);
  totalPaginas = signal(0);
  totalAlumnos = signal(0);
  totalConDeuda = signal(0);
  totalAlDia = signal(0);

  q = '';
  nivel: Nivel = 'PREUNIVERSITARIO';
  area: string | null = null;

  esAdminOCajero = () => this.auth.tieneRol('ROLE_ADMIN', 'ROLE_CAJERO');
  nivelEtiqueta = () => this.niveles().find((n) => n.valor === this.nivel)?.etiqueta ?? this.nivel;
  areas = () => this.areasDisponibles();

  ngOnInit(): void {
    this.service.niveles().subscribe((n) => this.niveles.set(n));
    this.cargarAreas();
    this.cargar(0);
  }

  cambiarNivel(nivel: Nivel): void {
    this.nivel = nivel;
    this.area = null;
    this.cargarAreas();
    this.cargar(0);
  }

  private cargarAreas(): void {
    this.service.areas(this.nivel).subscribe((a) => this.areasDisponibles.set(a));
  }

  cargar(pagina: number): void {
    this.cargando.set(true);
    this.service.listar({ q: this.q, nivel: this.nivel, area: this.area, page: pagina, size: 15 }).subscribe({
      next: (p) => {
        this.alumnos.set(p.contenido);
        this.pagina.set(p.paginaActual);
        this.totalPaginas.set(p.totalPaginas);
        this.deuda.set(p.deuda);
        this.totalAlumnos.set(p.totalAlumnos);
        this.totalConDeuda.set(p.totalConDeuda);
        this.totalAlDia.set(p.totalAlDia);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  eliminar(a: Alumno): void {
    if (!confirm(`¿Eliminar al alumno "${a.nombreCompleto}"?`)) return;
    this.service.eliminar(a.id).subscribe(() => this.cargar(this.pagina()));
  }
}
