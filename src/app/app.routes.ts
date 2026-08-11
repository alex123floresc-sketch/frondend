import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { MainLayoutComponent } from './shared/layout/main-layout.component';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    // Layout con sidebar para toda la parte privada (rutas hijas protegidas)
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'cursos', pathMatch: 'full' },
      {
        path: 'cursos',
        loadComponent: () =>
          import('./features/cursos/cursos-lista.component').then((m) => m.CursosListaComponent)
      },
      {
        path: 'cursos/nuevo',
        loadComponent: () =>
          import('./features/cursos/curso-form.component').then((m) => m.CursoFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'cursos/editar/:id',
        loadComponent: () =>
          import('./features/cursos/curso-form.component').then((m) => m.CursoFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      }
      // A medida que migremos módulos, se agregan aquí: alumnos, matriculas, pagos, ...
    ]
  },
  { path: '**', redirectTo: '' }
];
