export interface RegistroIngreso {
  id: number;
  alumnoId: number;
  alumnoNombreCompleto: string;
  alumnoDni: string;
  horaIngreso: string;
}

export interface AsistenciaRegistro {
  id: number;
  alumnoId: number;
  alumnoNombreCompleto: string;
  alumnoDni: string;
  horaRegistro: string;
}

export interface AsistenciaResultado {
  ok: boolean;
  mensaje: string;
  alumnoNombre: string | null;
}

export interface HorarioAsignacion {
  id: number;
  bloqueId: number;
  diaSemana: string;
  cursoId: number;
  cursoCodigo: string;
  cursoNombre: string;
  profesorNombre: string | null;
  aula: string | null;
}

export interface RegistroHoras {
  id: number;
  profesorId: number;
  horarioId: number;
  fecha: string;
  horaLlegada: string | null;
  horaInicio: string | null;
  horaFin: string | null;
  horas: number | null;
  observaciones: string | null;
}
