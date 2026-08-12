import { Component, inject, signal, OnInit } from '@angular/core';
import { AreaResumen, AreaService } from '../../core/services/area.service';
import { CursoService } from '../../core/services/curso.service';
import { Curso, Nivel, OpcionNivel } from '../../core/models/curso.model';

const TODOS_LOS_NIVELES: Nivel[] = ['PRIMARIA', 'SECUNDARIA', 'PREUNIVERSITARIO'];

@Component({
  selector: 'app-areas',
  standalone: true,
  imports: [],
  template: `
    <div class="barra-superior"><h2>Áreas / grados</h2></div>

    <div class="tabs-nivel">
      @for (n of todosLosNiveles; track n) {
        <button class="tab" [class.activo]="nivel === n" (click)="cambiarNivel(n)">{{ n }} ({{ obtenerConteo(n) }})</button>
      }
    </div>

    @if (!areaSeleccionada()) {
      <div class="entity-grid">
        @for (r of resumenes(); track r.nombre) {
          <div class="tarjeta entity-card" (click)="seleccionarArea(r.nombre)" style="cursor:pointer">
            <h3>{{ r.nombre }}</h3>
            <p>{{ r.cursos }} curso(s) · {{ r.profesores }} profesor(es) · {{ r.alumnos }} alumno(s)</p>
          </div>
        }
      </div>
    } @else {
      <div class="barra-superior">
        <h3>{{ areaSeleccionada() }}</h3>
        <button class="btn-secundario" (click)="areaSeleccionada.set(null)">← Volver a áreas</button>
      </div>

      <div class="tarjeta">
        <p>Marca los cursos que pertenecen a "{{ areaSeleccionada() }}" en {{ nivel }}:</p>
        @for (c of cursosDisponibles(); track c.id) {
          <label style="display:block;font-weight:400">
            <input type="checkbox" style="width:auto" [checked]="seleccionados().includes(c.id)" (change)="alternar(c.id)" />
            {{ c.codigo }} — {{ c.nombre }}
          </label>
        }
        <button (click)="guardar()" style="margin-top:1rem">Guardar cursos del área</button>
      </div>
    }
  `,
  styles: [`
    .tabs-nivel { display: flex; gap: .5rem; margin-bottom: 1rem; }
    .tab { background: #fff; border: 1px solid var(--color-borde); border-radius: .4rem; padding: .4rem .9rem; cursor: pointer; }
    .tab.activo { background: var(--color-primario); color: #fff; border-color: var(--color-primario); }
    .entity-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
  `]
})
export class AreasComponent implements OnInit {
  private areaService = inject(AreaService);
  private cursoService = inject(CursoService);

  todosLosNiveles = TODOS_LOS_NIVELES;
  nivel: Nivel = 'PREUNIVERSITARIO';
  conteoPorNivel = signal<Record<string, number>>({});
  resumenes = signal<AreaResumen[]>([]);
  areaSeleccionada = signal<string | null>(null);
  cursosDisponibles = signal<Curso[]>([]);
  seleccionados = signal<number[]>([]);

  ngOnInit(): void {
    this.areaService.porNivel().subscribe((c) => this.conteoPorNivel.set(c as any));
    this.cargarResumen();
  }

  obtenerConteo(n: Nivel): number {
    return this.conteoPorNivel()[n] ?? 0;
  }

  cambiarNivel(n: Nivel): void {
    this.nivel = n;
    this.areaSeleccionada.set(null);
    this.cargarResumen();
  }

  private cargarResumen(): void {
    this.areaService.resumen(this.nivel).subscribe((r) => this.resumenes.set(r));
  }

  seleccionarArea(area: string): void {
    this.areaSeleccionada.set(area);
    this.areaService.cursosDeArea(this.nivel, area).subscribe((cursos) => {
      this.cursosDisponibles.set(cursos);
      this.seleccionados.set(cursos.filter((c) => c.areas.includes(area)).map((c) => c.id));
    });
  }

  alternar(cursoId: number): void {
    const actuales = this.seleccionados();
    this.seleccionados.set(actuales.includes(cursoId) ? actuales.filter((x) => x !== cursoId) : [...actuales, cursoId]);
  }

  guardar(): void {
    const area = this.areaSeleccionada();
    if (!area) return;
    this.areaService.guardar(this.nivel, area, this.seleccionados()).subscribe(() => {
      this.cargarResumen();
      this.areaSeleccionada.set(null);
    });
  }
}
