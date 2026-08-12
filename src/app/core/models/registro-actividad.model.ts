export interface RegistroActividad {
  id: number;
  username: string;
  accion: string;
  accionEtiqueta: string;
  modulo: string;
  entidadId: number | null;
  descripcion: string | null;
  fecha: string;
}

export interface PaginaActividad {
  contenido: RegistroActividad[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanio: number;
  totalHoy: number;
  totalSemana: number;
}
