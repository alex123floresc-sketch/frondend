import { Nivel } from './curso.model';
import { Matricula } from './matricula.model';
import { Pago } from './pago.model';

export type Turno = 'MANANA' | 'TARDE' | 'NOCHE';

export const TURNOS: { valor: Turno; etiqueta: string }[] = [
  { valor: 'MANANA', etiqueta: 'Mañana' },
  { valor: 'TARDE', etiqueta: 'Tarde' },
  { valor: 'NOCHE', etiqueta: 'Noche' }
];

/** Reflejo de AlumnoDTO del backend. */
export interface Alumno {
  id: number;
  nombre: string;
  apellido: string;
  nombreCompleto: string;
  email: string | null;
  celular: string | null;
  dni: string;
  nombrePadre: string | null;
  telefonoPadre: string | null;
  area: string;
  nivel: Nivel;
  nivelEtiqueta: string;
  fotoPresente: boolean;
}

/** Reflejo de MatricularRequest, usado tanto suelto como dentro de AlumnoRequest. */
export interface MatricularRequest {
  cicloId: number;
  turno: Turno;
  area: string;
  conceptoMatricula?: string | null;
  montoMatricula?: number | null;
  conceptoPension?: string | null;
  montoPension?: number | null;
  numeroCuotas?: number | null;
}

/** Reflejo de AlumnoRequest (cuerpo JSON para crear/editar). */
export interface AlumnoRequest {
  id?: number | null;
  nombre: string;
  apellido: string;
  email?: string | null;
  celular?: string | null;
  dni: string;
  nombrePadre?: string | null;
  telefonoPadre?: string | null;
  area: string;
  nivel: Nivel;
  matriculaInicial?: MatricularRequest | null;
}

export interface MatriculaConPagos {
  matricula: Matricula;
  pagos: Pago[];
}

/** Respuesta de GET /api/alumnos/{id}/expediente. */
export interface Expediente {
  alumno: Alumno;
  matriculas: MatriculaConPagos[];
  totalPagado: number;
  totalPendiente: number;
  matriculasActivas: number;
}

export interface PaginaAlumnos {
  contenido: Alumno[];
  paginaActual: number;
  totalPaginas: number;
  totalElementos: number;
  tamanio: number;
  deuda: Record<number, boolean>;
  totalAlumnos: number;
  totalConDeuda: number;
  totalAlDia: number;
}
