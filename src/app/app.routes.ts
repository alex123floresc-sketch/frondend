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
      },

      // Bloque 2: núcleo académico
      {
        path: 'alumnos',
        loadComponent: () => import('./features/alumnos/alumnos-lista.component').then((m) => m.AlumnosListaComponent)
      },
      {
        path: 'alumnos/nuevo',
        loadComponent: () => import('./features/alumnos/alumno-form.component').then((m) => m.AlumnoFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] }
      },
      {
        path: 'alumnos/editar/:id',
        loadComponent: () => import('./features/alumnos/alumno-form.component').then((m) => m.AlumnoFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] }
      },
      {
        path: 'alumnos/:id/expediente',
        loadComponent: () =>
          import('./features/alumnos/alumno-expediente.component').then((m) => m.AlumnoExpedienteComponent)
      },

      {
        path: 'profesores',
        loadComponent: () =>
          import('./features/profesores/profesores-lista.component').then((m) => m.ProfesoresListaComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] }
      },
      {
        path: 'profesores/nuevo',
        loadComponent: () =>
          import('./features/profesores/profesor-form.component').then((m) => m.ProfesorFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'profesores/editar/:id',
        loadComponent: () =>
          import('./features/profesores/profesor-form.component').then((m) => m.ProfesorFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'profesores/:id',
        loadComponent: () =>
          import('./features/profesores/profesor-detalle.component').then((m) => m.ProfesorDetalleComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] }
      },

      {
        path: 'ciclos',
        loadComponent: () => import('./features/ciclos/ciclos-lista.component').then((m) => m.CiclosListaComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'ciclos/nuevo',
        loadComponent: () => import('./features/ciclos/ciclo-form.component').then((m) => m.CicloFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'ciclos/editar/:id',
        loadComponent: () => import('./features/ciclos/ciclo-form.component').then((m) => m.CicloFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },

      {
        path: 'areas',
        loadComponent: () => import('./features/areas/areas.component').then((m) => m.AreasComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] }
      },

      {
        path: 'pagos',
        loadComponent: () => import('./features/pagos/pagos-lista.component').then((m) => m.PagosListaComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN', 'ROLE_CAJERO'] }
      },

      // Bloque 3a: usuarios, perfil, historial, búsqueda
      {
        path: 'usuarios',
        loadComponent: () => import('./features/usuarios/usuarios-lista.component').then((m) => m.UsuariosListaComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'usuarios/nuevo',
        loadComponent: () => import('./features/usuarios/usuario-form.component').then((m) => m.UsuarioFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'usuarios/editar/:id',
        loadComponent: () => import('./features/usuarios/usuario-form.component').then((m) => m.UsuarioFormComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/perfil/perfil-form.component').then((m) => m.PerfilFormComponent)
      },
      {
        path: 'actividad',
        loadComponent: () => import('./features/actividad/actividad-lista.component').then((m) => m.ActividadListaComponent),
        canActivate: [authGuard],
        data: { roles: ['ROLE_ADMIN'] }
      },
      {
        path: 'buscar',
        loadComponent: () =>
          import('./features/busqueda/busqueda-resultados.component').then((m) => m.BusquedaResultadosComponent)
      }
      // A medida que migremos módulos, se agregan aquí: horarios, asistencias, horas docentes, ...
    ]
  },
  { path: '**', redirectTo: '' }
];
