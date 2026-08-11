export type Nivel = 'PRIMARIA' | 'SECUNDARIA' | 'PREUNIVERSITARIO';

/** Reflejo de CursoDTO del backend. */
export interface Curso {
  id: number;
  codigo: string;
  nombre: string;
  horas: number;
  nivel: Nivel;
  nivelEtiqueta: string;
  profesorId: number | null;
  profesorNombre: string | null;
  areas: string[];
  destacadoWeb: boolean;
}

/** Reflejo de CursoForm (lo que se envía al crear/editar). */
export interface CursoForm {
  id?: number | null;
  codigo: string;
  nombre: string;
  horas: number | null;
  nivel: Nivel | null;
  profesorId?: number | null;
  destacadoWeb: boolean;
}

/** Estructura de la respuesta paginada de la API. */
export interface PaginaCursos {
  contenido: Curso[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanio: number;
}

export interface OpcionNivel {
  valor: Nivel;
  etiqueta: string;
}
