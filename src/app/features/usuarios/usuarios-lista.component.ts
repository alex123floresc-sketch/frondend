import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioAdminService } from '../../core/services/usuario-admin.service';
import { UsuarioAdmin } from '../../core/models/usuario-admin.model';

@Component({
  selector: 'app-usuarios-lista',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="barra-superior">
      <h2>Usuarios</h2>
      <a routerLink="/usuarios/nuevo"><button>+ Nuevo usuario</button></a>
    </div>

    <div class="tarjeta filtros">
      <div class="campo">
        <label>Buscar</label>
        <input [(ngModel)]="q" (keyup.enter)="cargar(0)" placeholder="Usuario o nombre" />
      </div>
      <button (click)="cargar(0)">Filtrar</button>
    </div>

    @if (cargando()) {
      <p>Cargando usuarios…</p>
    } @else {
      <table>
        <thead><tr><th>Usuario</th><th>Nombre</th><th>Roles</th><th>Estado</th><th></th></tr></thead>
        <tbody>
          @for (u of usuarios(); track u.id) {
            <tr>
              <td>{{ u.username }}</td>
              <td>{{ u.nombre }}</td>
              <td>@for (r of u.roles; track r) { <span class="badge badge-nivel">{{ r }}</span> }</td>
              <td>
                @if (u.activo) { <span class="badge badge-ok">Activo</span> } @else { <span class="badge">Inactivo</span> }
              </td>
              <td class="acciones">
                <a [routerLink]="['/usuarios/editar', u.id]"><button class="btn-secundario">Editar</button></a>
                <button class="btn-peligro" (click)="eliminar(u)">Eliminar</button>
              </td>
            </tr>
          } @empty {
            <tr><td colspan="5">No hay usuarios que coincidan.</td></tr>
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
export class UsuariosListaComponent implements OnInit {
  private service = inject(UsuarioAdminService);

  usuarios = signal<UsuarioAdmin[]>([]);
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
        this.usuarios.set(p.contenido);
        this.pagina.set(p.paginaActual);
        this.totalPaginas.set(p.totalPaginas);
        this.cargando.set(false);
      },
      error: () => this.cargando.set(false)
    });
  }

  eliminar(u: UsuarioAdmin): void {
    if (!confirm(`¿Eliminar al usuario "${u.username}"?`)) return;
    this.service.eliminar(u.id).subscribe(() => this.cargar(this.pagina()));
  }
}
