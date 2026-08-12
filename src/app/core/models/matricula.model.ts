export interface MatriculaDetalle {
  id: number;
  cursoId: number;
  cursoCodigo: string;
  cursoNombre: string;
  cursoHoras: number;
}

/** Reflejo de MatriculaDTO. */
export interface Matricula {
  id: number;
  alumnoId: number;
  alumnoNombreCompleto: string;
  alumnoDni: string;
  cicloId: number;
  cicloNombre: string;
  turno: string;
  fechaMatricula: string;
  estado: string;
  totalHoras: number;
  detalles: MatriculaDetalle[];
}
