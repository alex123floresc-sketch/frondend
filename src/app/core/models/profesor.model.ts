import { Nivel } from './curso.model';

export interface Profesor {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string;
  especialidad: string | null;
  tarifaHora: number | null;
  niveles: Nivel[];
  fotoPresente: boolean;
  destacadoWeb: boolean;
}

export interface ProfesorRequest {
  id?: number | null;
  nombre: string;
  apellido: string;
  email: string;
  especialidad?: string | null;
  tarifaHora?: number | null;
  niveles: Nivel[];
  destacadoWeb: boolean;
}

export interface PaginaProfesores {
  contenido: Profesor[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanio: number;
}
