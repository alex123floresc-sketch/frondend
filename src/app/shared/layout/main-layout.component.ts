import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  roles?: string[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  template: `
    <div class="contenedor">
      <aside class="sidebar">
        <div class="marca">Lapreplus</div>
        <nav>
          @for (item of menuVisible(); track item.ruta) {
            <a [routerLink]="item.ruta" routerLinkActive="activo">{{ item.etiqueta }}</a>
          }
        </nav>
      </aside>

      <div class="area-principal">
        <header class="cabecera">
          <input class="buscador" [(ngModel)]="q" (keyup.enter)="buscar()" placeholder="Buscar alumno, profesor, curso…" />
          <a routerLink="/perfil" class="usuario">{{ auth.usuario()?.nombre }}</a>
          <button class="btn-secundario" (click)="salir()">Cerrar sesión</button>
        </header>
        <main class="contenido">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .contenedor { display: flex; min-height: 100vh; }
    .sidebar { width: 220px; background: var(--color-primario); color: #fff; padding: 1rem 0; flex-shrink: 0; }
    .marca { font-size: 1.3rem; font-weight: 700; padding: .5rem 1.25rem 1rem; border-bottom: 1px solid rgba(255,255,255,.15); }
    nav { display: flex; flex-direction: column; margin-top: .5rem; }
    nav a { color: #cdd6e4; padding: .6rem 1.25rem; font-size: .92rem; }
    nav a:hover { background: rgba(255,255,255,.08); color: #fff; text-decoration: none; }
    nav a.activo { background: var(--color-acento); color: #fff; font-weight: 600; }
    .area-principal { flex: 1; display: flex; flex-direction: column; }
    .cabecera { display: flex; justify-content: flex-end; align-items: center; gap: 1rem; padding: .75rem 1.5rem; background: #fff; border-bottom: 1px solid var(--color-borde); }
    .buscador { flex: 1; max-width: 360px; margin-right: auto; }
    .usuario { font-weight: 600; color: var(--color-secundario); }
    .contenido { padding: 1.5rem; flex: 1; }
  `]
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  q = '';

  private items: ItemMenu[] = [
    { ruta: '/alumnos', etiqueta: 'Alumnos' },
    { ruta: '/profesores', etiqueta: 'Profesores', roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] },
    { ruta: '/cursos', etiqueta: 'Cursos' },
    { ruta: '/areas', etiqueta: 'Áreas', roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] },
    { ruta: '/ciclos', etiqueta: 'Ciclos', roles: ['ROLE_ADMIN'] },
    { ruta: '/pagos', etiqueta: 'Pagos', roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] },
    { ruta: '/usuarios', etiqueta: 'Usuarios', roles: ['ROLE_ADMIN'] },
    { ruta: '/actividad', etiqueta: 'Historial', roles: ['ROLE_ADMIN'] }
    // Se irán agregando: Horarios, Asistencias, Horas docentes, etc.
  ];

  menuVisible(): ItemMenu[] {
    return this.items.filter((i) => !i.roles || this.auth.tieneRol(...i.roles));
  }

  buscar(): void {
    if (this.q.trim()) {
      this.router.navigate(['/buscar'], { queryParams: { q: this.q } });
    }
  }

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
