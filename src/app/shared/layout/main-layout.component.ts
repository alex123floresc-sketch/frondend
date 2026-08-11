import { Component, inject } from '@angular/core';
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
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
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
          <span class="usuario">{{ auth.usuario()?.nombre }}</span>
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
    .usuario { font-weight: 600; color: var(--color-secundario); }
    .contenido { padding: 1.5rem; flex: 1; }
  `]
})
export class MainLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  private items: ItemMenu[] = [
    { ruta: '/cursos', etiqueta: 'Cursos' }
    // Se irán agregando: Alumnos, Matrículas, Pagos, Profesores, etc.
  ];

  menuVisible(): ItemMenu[] {
    return this.items.filter((i) => !i.roles || this.auth.tieneRol(...i.roles));
  }

  salir(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
