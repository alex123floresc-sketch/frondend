import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/** Protege las rutas privadas: si no hay sesión, redirige al login. */
export const authGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.autenticado()) {
    router.navigate(['/login']);
    return false;
  }

  // Control opcional por rol: se define en la ruta con data: { roles: ['ROLE_ADMIN'] }
  const rolesRequeridos = route.data?.['roles'] as string[] | undefined;
  if (rolesRequeridos && rolesRequeridos.length > 0 && !auth.tieneRol(...rolesRequeridos)) {
    router.navigate(['/']);
    return false;
  }

  return true;
};
