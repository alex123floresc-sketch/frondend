import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CursoService } from '../../core/services/curso.service';
import { AuthService } from '../../core/services/auth.service';
import { Curso, Nivel, OpcionNivel } from '../../core/models/curso.model';

@Component({
  selector: 'app-cursos-lista',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="barra-superior">
      <h2>Cursos</h2>
      @if (esAdmin()) {
        <a routerLink="/cursos/nuevo"><button>+ Nuevo curso</button></a>
      }
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Buscar</label>
        <input [(ngModel)]="q" (keyup.enter)="cargar(0)" placeholder="Código o nombre" />
      </div>
      <div class="campo">
        <label>Nivel</label>
        <select [(ngModel)]="nivel">
          <option [ngValue]="null">Todos</option>
          @for (n of niveles(); track n.valor) {
            <option [ngValue]="n.valor">{{ n.etiqueta }}</option>
          }
        </select>
      </div>
      <button (click)="cargar(0)">Filtrar</button>
    </div>

    @if (cargando()) {
      <p>Cargando cursos…</p>
    } @else {
      <table>
        <thead>
          <tr>
            <th>Código</th><th>Nombre</th><th>Horas</th><th>Nivel</th><th>Profesor</th><th></th>
          </tr>
        </thead>
        <tbody>
          @for (c of cursos(); track c.id) {
            <tr>
              <td>{{ c.codigo }}</td>
              <td>{{ c.nombre }}</td>
              <td>{{ c.horas }}</td>
              <td><span class="badge badge-nivel">{{ c.nivelEtiqueta }}</span></td>
              <td>{{ c.profesorNombre ?? '—' }}</td>
              <td>
                @if (esAdmin()) {
                  <a [routerLink]="['/cursos/editar', c.id]"><button class="btn-secundario">Editar</button></a>
                  <button class="btn-peligro" (click)="eliminar(c)">Eliminar</button>
                }
              </td>
            </tr>
          } @empty {
            <tr><td colspan="6">No hay cursos que coincidan.</td></tr>
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
    .paginacion { display: flex; gap: 1rem; align-items: center; justify-content: center; margin-top: 1rem; }
  `]
})
export class CursosListaComponent implements OnInit {
  private service = inject(CursoService);
  private auth = inject(AuthService);

  cursos = signal<Curso[]>([]);
  niveles = signal<OpcionNivel[]>([]);
  cargando = signal(false);
  pagina = signal(0);
  totalPaginas = signal(0);

  q = '';
  nivel: Nivel | null = null;

  esAdmin = () => this.auth.tieneRol('ROLE_ADMIN');

  ngOnInit(): void {
    this.service.niveles().subscribe((n) => this.niveles.set(n));
    this.cargar(0);
  }

  cargar(pagina: number): void {
    this.cargando.set(true);
    this.service.listar({ q: this.q, nivel: this.nivel, page: pagina, size: 15 }).subscribe({
      next: (p) => {
        this.cursos.set(p.contenido);
        this.pagina.set(p.paginaActual);
        this.totalPaginas.set(p.totalPaginas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  eliminar(c: Curso): void {
    if (!confirm(`¿Eliminar el curso "${c.nombre}"?`)) return;
    this.service.eliminar(c.id).subscribe(() => this.cargar(this.pagina()));
  }
}
