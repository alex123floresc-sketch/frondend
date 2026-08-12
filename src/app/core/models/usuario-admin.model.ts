export interface UsuarioAdmin {
  id: number;
  username: string;
  nombre: string;
  activo: boolean;
  roles: string[];
  email: string | null;
  telefono: string | null;
  cargo: string | null;
  fotoPresente: boolean;
}

export interface UsuarioRequest {
  id?: number | null;
  username: string;
  nombre: string;
  passwordPlano?: string | null;
  rolId: number;
  activo: boolean;
}

export interface RolOpcion {
  id: number;
  nombre: string;
}

export interface PaginaUsuarios {
  contenido: UsuarioAdmin[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanio: number;
  esDesarrollador: boolean;
}
