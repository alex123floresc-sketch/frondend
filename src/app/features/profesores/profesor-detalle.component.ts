import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { DetalleProfesor, ProfesorService } from '../../core/services/profesor.service';

@Component({
  selector: 'app-profesor-detalle',
  standalone: true,
  imports: [RouterLink, DecimalPipe],
  template: `
    <div class="barra-superior">
      <h2>Profesor</h2>
      <a routerLink="/profesores"><button class="btn-secundario">Volver</button></a>
    </div>

    @if (detalle(); as d) {
      <div class="tarjeta">
        <h3>{{ d.profesor.nombreCompleto }}</h3>
        <p>{{ d.profesor.email }} · {{ d.profesor.especialidad ?? 'Sin especialidad' }}</p>
        <p>Tarifa por hora: S/ {{ d.profesor.tarifaHora ?? 0 | number:'1.2-2' }}</p>
      </div>

      <div class="tarjeta-fila">
        <div class="tarjeta stat"><span class="stat-num">{{ d.cursos.length }}</span><span>Cursos asignados</span></div>
        <div class="tarjeta stat"><span class="stat-num">{{ d.horasQuincena | number:'1.1-1' }}</span><span>Horas esta quincena</span></div>
        <div class="tarjeta stat stat-alerta"><span class="stat-num">S/ {{ d.pendienteQuincena | number:'1.2-2' }}</span><span>Pendiente de pago</span></div>
      </div>

      <div class="tarjeta">
        <h4>Cursos</h4>
        <ul>
          @for (c of d.cursos; track c.id) { <li>{{ c.nombre }}</li> }
          @empty { <li>Sin cursos asignados.</li> }
        </ul>
      </div>
    }
  `,
  styles: [`
    .tarjeta-fila { display: flex; gap: 1rem; margin: 1rem 0; }
    .stat { display: flex; flex-direction: column; align-items: center; padding: .75rem 1.5rem; }
    .stat-num { font-size: 1.3rem; font-weight: 700; color: var(--color-secundario); }
    .stat-alerta .stat-num { color: #dc2626; }
  `]
})
export class ProfesorDetalleComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private service = inject(ProfesorService);

  detalle = signal<DetalleProfesor | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.service.detalle(id).subscribe((d) => this.detalle.set(d));
  }
}
