/** Reflejo de CicloDTO del backend. */
export interface Ciclo {
  id: number;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface CicloForm {
  id?: number | null;
  nombre: string;
  fechaInicio: string;
  fechaFin: string;
  activo: boolean;
}

export interface PaginaCiclos {
  contenido: Ciclo[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanio: number;
}
