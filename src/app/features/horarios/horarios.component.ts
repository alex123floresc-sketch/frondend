import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HorarioService } from '../../core/services/horario.service';
import { CicloService } from '../../core/services/ciclo.service';
import { CursoService } from '../../core/services/curso.service';
import { AuthService } from '../../core/services/auth.service';
import { DIAS, DiaSemana, FilaHorario, GrillaHorarios } from '../../core/models/horario.model';
import { Ciclo } from '../../core/models/ciclo.model';
import { Nivel, OpcionNivel, Curso } from '../../core/models/curso.model';

const TURNOS = ['MANANA', 'TARDE', 'NOCHE'];
const TODOS_LOS_NIVELES: Nivel[] = ['PRIMARIA', 'SECUNDARIA', 'PREUNIVERSITARIO'];

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="barra-superior"><h2>Horarios</h2></div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Ciclo</label>
        <select [(ngModel)]="cicloId" (ngModelChange)="cargarGrilla()">
          @for (c of ciclos(); track c.id) { <option [ngValue]="c.id">{{ c.nombre }}</option> }
        </select>
      </div>
    </div>

    <div class="tabs-nivel">
      @for (n of todosLosNiveles; track n) {
        <button class="tab" [class.activo]="nivel === n" (click)="cambiarNivel(n)">{{ n }}</button>
      }
    </div>
    <div class="tabs-nivel">
      @for (a of areas(); track a) {
        <button class="tab" [class.activo]="area === a" (click)="cambiarArea(a)">{{ a }}</button>
      }
    </div>

    @if (grilla(); as g) {
      <p>{{ g.totalBloques }} bloques · {{ g.totalAsignaciones }} cursos asignados</p>

      @if (esAdmin()) {
        <div class="tarjeta">
          <h4>Agregar bloque horario</h4>
          <div class="filtros">
            <div class="campo"><label>Turno</label>
              <select [(ngModel)]="nuevoTurno"><option value="MANANA">Mañana</option><option value="TARDE">Tarde</option><option value="NOCHE">Noche</option></select>
            </div>
            <div class="campo"><label>Hora inicio</label><input type="time" [(ngModel)]="nuevoHoraInicio" /></div>
            <div class="campo"><label>Hora fin</label><input type="time" [(ngModel)]="nuevoHoraFin" /></div>
            <div class="campo"><label>Tipo</label>
              <select [(ngModel)]="nuevoTipo"><option value="CLASE">Clase</option><option value="RECESO">Receso</option></select>
            </div>
            <button (click)="crearBloque()">+ Agregar</button>
          </div>
        </div>
      }

      @for (turno of turnos; track turno) {
        <div class="tarjeta">
          <h3>{{ turno }}</h3>
          <div class="tabla-scroll">
            <table>
              <thead>
                <tr><th>Hora</th>@for (d of dias; track d.valor) { <th>{{ d.etiqueta }}</th> }@if (esAdmin()) { <th></th> }</tr>
              </thead>
              <tbody>
                @for (fila of g.turnos[turno] ?? []; track fila.bloque.id) {
                  <tr [class.receso]="fila.bloque.tipo === 'RECESO'">
                    <td>{{ fila.bloque.horaInicio }}–{{ fila.bloque.horaFin }}</td>
                    @for (d of dias; track d.valor) {
                      <td>
                        @if (fila.bloque.tipo === 'RECESO') {
                          <em>Receso</em>
                        } @else {
                          @for (h of fila.porDia[d.valor] ?? []; track h.id) {
                            <div class="curso-asignado">
                              {{ h.cursoCodigo }}
                              @if (esAdmin()) { <button class="btn-mini" (click)="quitarCurso(h.id)">×</button> }
                            </div>
                          }
                          @if (esAdmin()) {
                            <button class="btn-mini" (click)="abrirAsignar(fila.bloque.id, d.valor)">+ curso</button>
                          }
                        }
                      </td>
                    }
                    @if (esAdmin()) {
                      <td><button class="btn-peligro btn-mini" (click)="eliminarBloque(fila.bloque.id)">Eliminar bloque</button></td>
                    }
                  </tr>
                } @empty {
                  <tr><td [attr.colspan]="dias.length + 2">Sin bloques en este turno.</td></tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    }

    @if (asignando(); as ctx) {
      <div class="tarjeta">
        <h4>Asignar curso — {{ ctx.dia }}</h4>
        @for (c of cursosDisponibles(); track c.id) {
          <label style="display:block;font-weight:400">
            <input type="checkbox" style="width:auto" [checked]="cursosSeleccionados().includes(c.id)" (change)="alternarCurso(c.id)" />
            {{ c.codigo }} — {{ c.nombre }} @if (c.profesorNombre) { ({{ c.profesorNombre }}) }
          </label>
        }
        <button (click)="guardarAsignacion()" style="margin-top:1rem">Guardar</button>
        <button class="btn-secundario" (click)="asignando.set(null)">Cancelar</button>
      </div>
    }
  `,
  styles: [`
    .tabs-nivel { display: flex; gap: .5rem; margin-bottom: .75rem; flex-wrap: wrap; }
    .tab { background: #fff; border: 1px solid var(--color-borde); border-radius: .4rem; padding: .35rem .8rem; cursor: pointer; font-size: .85rem; }
    .tab.activo { background: var(--color-primario); color: #fff; border-color: var(--color-primario); }
    .tabla-scroll { overflow-x: auto; }
    .curso-asignado { display: inline-flex; align-items: center; gap: .25rem; background: #eef2ff; border-radius: .3rem; padding: .1rem .4rem; margin: .1rem; font-size: .8rem; }
    .btn-mini { font-size: .75rem; padding: .1rem .4rem; }
    tr.receso td { background: #f8fafc; color: #94a3b8; }
  `]
})
export class HorariosComponent implements OnInit {
  private service = inject(HorarioService);
  private cicloService = inject(CicloService);
  private cursoService = inject(CursoService);
  private auth = inject(AuthService);

  todosLosNiveles = TODOS_LOS_NIVELES;
  turnos = TURNOS;
  dias = DIAS;

  ciclos = signal<Ciclo[]>([]);
  cicloId: number | null = null;
  nivel: Nivel = 'PREUNIVERSITARIO';
  area: string | null = null;
  areasDisponibles = signal<string[]>([]);
  grilla = signal<GrillaHorarios | null>(null);

  nuevoTurno = 'MANANA';
  nuevoHoraInicio = '';
  nuevoHoraFin = '';
  nuevoTipo: 'CLASE' | 'RECESO' = 'CLASE';

  asignando = signal<{ bloqueId: number; dia: DiaSemana } | null>(null);
  cursosDisponibles = signal<Curso[]>([]);
  cursosSeleccionados = signal<number[]>([]);

  esAdmin = () => this.auth.tieneRol('ROLE_ADMIN');
  areas = () => this.areasDisponibles();

  ngOnInit(): void {
    this.cicloService.todos().subscribe((c) => {
      this.ciclos.set(c);
      const activo = c.find((x) => x.activo);
      this.cicloId = activo ? activo.id : (c[0]?.id ?? null);
      this.cargarAreas();
    });
  }

  cambiarNivel(n: Nivel): void {
    this.nivel = n;
    this.area = null;
    this.cargarAreas();
  }

  cambiarArea(a: string): void {
    this.area = a;
    this.cargarGrilla();
  }

  private cargarAreas(): void {
    this.cursoService.areas(this.nivel).subscribe((a) => {
      this.areasDisponibles.set(a);
      this.area = a[0] ?? null;
      this.cargarGrilla();
    });
  }

  cargarGrilla(): void {
    if (!this.cicloId || !this.area) return;
    this.service.grilla(this.cicloId, this.nivel, this.area).subscribe((g) => this.grilla.set(g));
  }

  crearBloque(): void {
    if (!this.cicloId || !this.area || !this.nuevoHoraInicio || !this.nuevoHoraFin) return;
    this.service.crearBloque({
      cicloId: this.cicloId, nivel: this.nivel, turno: this.nuevoTurno,
      horaInicio: this.nuevoHoraInicio, horaFin: this.nuevoHoraFin, tipo: this.nuevoTipo, area: this.area
    }).subscribe(() => {
      this.nuevoHoraInicio = '';
      this.nuevoHoraFin = '';
      this.cargarGrilla();
    });
  }

  eliminarBloque(bloqueId: number): void {
    if (!confirm('¿Eliminar este bloque horario?')) return;
    this.service.eliminarBloque(bloqueId).subscribe(() => this.cargarGrilla());
  }

  abrirAsignar(bloqueId: number, dia: DiaSemana): void {
    this.asignando.set({ bloqueId, dia });
    this.service.cursosParaAsignar(bloqueId, dia).subscribe((r) => {
      this.cursosDisponibles.set(r.cursosDisponibles);
      this.cursosSeleccionados.set(r.cursoIdsAgregados);
    });
  }

  alternarCurso(cursoId: number): void {
    const actuales = this.cursosSeleccionados();
    this.cursosSeleccionados.set(actuales.includes(cursoId) ? actuales.filter((x) => x !== cursoId) : [...actuales, cursoId]);
  }

  guardarAsignacion(): void {
    const ctx = this.asignando();
    if (!ctx) return;
    this.service.asignar({ bloqueId: ctx.bloqueId, dia: ctx.dia, cursoIds: this.cursosSeleccionados() }).subscribe(() => {
      this.asignando.set(null);
      this.cargarGrilla();
    });
  }

  quitarCurso(horarioId: number): void {
    this.service.quitarCurso(horarioId).subscribe(() => this.cargarGrilla());
  }
}
