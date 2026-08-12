export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO';
export const DIAS: { valor: DiaSemana; etiqueta: string }[] = [
  { valor: 'LUNES', etiqueta: 'Lunes' },
  { valor: 'MARTES', etiqueta: 'Martes' },
  { valor: 'MIERCOLES', etiqueta: 'Miércoles' },
  { valor: 'JUEVES', etiqueta: 'Jueves' },
  { valor: 'VIERNES', etiqueta: 'Viernes' },
  { valor: 'SABADO', etiqueta: 'Sábado' }
];

export interface BloqueHorario {
  id: number;
  cicloId: number;
  turno: string;
  area: string;
  nivel: string;
  horaInicio: string;
  horaFin: string;
  tipo: 'CLASE' | 'RECESO';
  tipoEtiqueta: string;
}

export interface HorarioAsignacion {
  id: number;
  bloqueId: number;
  diaSemana: DiaSemana;
  cursoId: number;
  cursoCodigo: string;
  cursoNombre: string;
  profesorNombre: string | null;
  aula: string | null;
}

export interface FilaHorario {
  bloque: BloqueHorario;
  porDia: Record<DiaSemana, HorarioAsignacion[]>;
}

export interface GrillaHorarios {
  turnos: Record<string, FilaHorario[]>;
  totalBloques: number;
  totalAsignaciones: number;
}

export interface CrearBloqueRequest {
  cicloId: number;
  nivel: string;
  turno: string;
  horaInicio: string;
  horaFin: string;
  tipo: 'CLASE' | 'RECESO';
  area: string;
}

export interface AsignarCursoRequest {
  bloqueId: number;
  dia: DiaSemana;
  cursoIds: number[];
}
