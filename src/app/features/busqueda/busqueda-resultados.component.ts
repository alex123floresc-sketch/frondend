import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BusquedaService, ResultadoBusqueda } from '../../core/services/busqueda.service';

@Component({
  selector: 'app-busqueda-resultados',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="barra-superior"><h2>Resultados para "{{ q() }}"</h2></div>

    @if (resultado(); as r) {
      <div class="tarjeta">
        <h3>Alumnos ({{ r.alumnos.length }})</h3>
        <ul>
          @for (a of r.alumnos; track a.id) {
            <li><a [routerLink]="['/alumnos', a.id, 'expediente']">{{ a.nombreCompleto }} — DNI {{ a.dni }}</a></li>
          }
          @empty { <li>Sin resultados.</li> }
        </ul>
      </div>

      @if (r.profesores.length || r.cursos.length) {
        <div class="tarjeta">
          <h3>Profesores ({{ r.profesores.length }})</h3>
          <ul>
            @for (p of r.profesores; track p.id) {
              <li><a [routerLink]="['/profesores', p.id]">{{ p.nombreCompleto }}</a></li>
            }
            @empty { <li>Sin resultados.</li> }
          </ul>
        </div>

        <div class="tarjeta">
          <h3>Cursos ({{ r.cursos.length }})</h3>
          <ul>
            @for (c of r.cursos; track c.id) { <li>{{ c.codigo }} — {{ c.nombre }}</li> }
            @empty { <li>Sin resultados.</li> }
          </ul>
        </div>
      }
    }
  `
})
export class BusquedaResultadosComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(BusquedaService);

  q = signal('');
  resultado = signal<ResultadoBusqueda | null>(null);

  ngOnInit(): void {
    this.route.queryParamMap.subscribe((params) => {
      const q = params.get('q') ?? '';
      this.q.set(q);
      if (q.trim()) {
        this.service.buscar(q).subscribe((r) => this.resultado.set(r));
      } else {
        this.resultado.set({ alumnos: [], profesores: [], cursos: [] });
      }
    });
  }
}
