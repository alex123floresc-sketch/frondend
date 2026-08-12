import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CicloService } from '../../core/services/ciclo.service';
import { Ciclo } from '../../core/models/ciclo.model';

@Component({
  selector: 'app-ciclos-lista',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="barra-superior">
      <h2>Ciclos</h2>
      <a routerLink="/ciclos/nuevo"><button>+ Nuevo ciclo</button></a>
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Buscar</label>
        <input [(ngModel)]="q" (keyup.enter)="cargar(0)" placeholder="Nombre del ciclo" />
      </div>
      <button (click)="cargar(0)">Filtrar</button>
    </div>

    @if (cargando()) {
      <p>Cargando ciclos…</p>
    } @else {
      <table>
        <thead><tr><th>Nombre</th><th>Inicio</th><th>Fin</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          @for (c of ciclos(); track c.id) {
            <tr>
              <td>{{ c.nombre }}</td>
              <td>{{ c.fechaInicio }}</td>
              <td>{{ c.fechaFin }}</td>
              <td>
                @if (c.activo) { <span class="badge badge-ok">Activo</span> } @else { <span class="badge">Inactivo</span> }
              </td>
              <td class="acciones">
                <a [routerLink]="['/ciclos/editar', c.id]"><button class="btn-secundario">Editar</button></a>
                <button class="btn-peligro" (click)="eliminar(c)">Eliminar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5">No hay ciclos que coincidan.</td></tr>
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
    .badge-ok { background: #dcfce7; color: #166534; }
    .acciones { display: flex; gap: .4rem; flex-wrap: wrap; }
    .paginacion { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1rem; }
  `]
})
export class CiclosListaComponent implements OnInit {
  private service = inject(CicloService);

  ciclos = signal<Ciclo[]>([]);
  cargando = signal(false);
  pagina = signal(0);
  totalPaginas = signal(0);
  q = '';

  ngOnInit(): void {
    this.cargar(0);
  }

  cargar(pagina: number): void {
    this.cargando.set(true);
    this.service.listar({ q: this.q, page: pagina, size: 15 }).subscribe({
      next: (p) => {
        this.ciclos.set(p.contenido);
        this.pagina.set(p.paginaActual);
        this.totalPaginas.set(p.totalPaginas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  eliminar(c: Ciclo): void {
    if (!confirm(`¿Eliminar el ciclo "${c.nombre}"?`)) return;
    this.service.eliminar(c.id).subscribe(() => this.cargar(this.pagina()));
  }
}
