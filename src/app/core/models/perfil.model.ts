export interface Perfil {
  id: number;
  username: string;
  nombre: string;
  email: string | null;
  telefono: string | null;
  cargo: string | null;
  fotoPresente: boolean;
  firmaPresente: boolean;
  roles: string[];
}

export interface PerfilRequest {
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  cargo?: string | null;
  passwordActual?: string | null;
  passwordNueva?: string | null;
  passwordNuevaConfirmar?: string | null;
}
