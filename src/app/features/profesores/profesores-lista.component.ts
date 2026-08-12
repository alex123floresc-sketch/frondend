import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProfesorService } from '../../core/services/profesor.service';
import { AuthService } from '../../core/services/auth.service';
import { Profesor } from '../../core/models/profesor.model';

@Component({
  selector: 'app-profesores-lista',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="barra-superior">
      <h2>Profesores</h2>
      @if (esAdmin()) {
        <a routerLink="/profesores/nuevo"><button>+ Nuevo profesor</button></a>
      }
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Buscar</label>
        <input [(ngModel)]="q" (keyup.enter)="cargar(0)" placeholder="Nombre, apellido o correo" />
      </div>
      <button (click)="cargar(0)">Filtrar</button>
    </div>

    @if (cargando()) {
      <p>Cargando profesores…</p>
    } @else {
      <table>
        <thead><tr><th>Nombre</th><th>Correo</th><th>Especialidad</th><th>Niveles</th><th></th></tr></thead>
        <tbody>
          @for (p of profesores(); track p.id) {
            <tr>
              <td>{{ p.nombreCompleto }}</td>
              <td>{{ p.email }}</td>
              <td>{{ p.especialidad ?? '—' }}</td>
              <td>
                @for (n of p.niveles; track n) { <span class="badge badge-nivel">{{ n }}</span> }
              </td>
              <td class="acciones">
                <a [routerLink]="['/profesores', p.id]"><button class="btn-secundario">Ver</button></a>
                @if (esAdmin()) {
                  <a [routerLink]="['/profesores/editar', p.id]"><button class="btn-secundario">Editar</button></a>
                  <button class="btn-peligro" (click)="eliminar(p)">Eliminar</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5">No hay profesores que coincidan.</td></tr>
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
    .acciones { display: flex; gap: .4rem; flex-wrap: wrap; }
    .paginacion { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1rem; }
  `]
})
export class ProfesoresListaComponent implements OnInit {
  private service = inject(ProfesorService);
  private auth = inject(AuthService);

  profesores = signal<Profesor[]>([]);
  cargando = signal(false);
  pagina = signal(0);
  totalPaginas = signal(0);
  q = '';

  esAdmin = () => this.auth.tieneRol('ROLE_ADMIN');

  ngOnInit(): void {
    this.cargar(0);
  }

  cargar(pagina: number): void {
    this.cargando.set(true);
    this.service.listar({ q: this.q, page: pagina, size: 15 }).subscribe({
      next: (p) => {
        this.profesores.set(p.contenido);
        this.pagina.set(p.paginaActual);
        this.totalPaginas.set(p.totalPaginas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  eliminar(p: Profesor): void {
    if (!confirm(`¿Eliminar al profesor "${p.nombreCompleto}"?`)) return;
    this.service.eliminar(p.id).subscribe(() => this.cargar(this.pagina()));
  }
}
