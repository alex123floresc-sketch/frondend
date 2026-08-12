/** Reflejo de PagoDTO. */
export interface Pago {
  id: number;
  matriculaId: number;
  concepto: string;
  monto: number;
  montoPagado: number;
  saldo: number;
  fechaVencimiento: string;
  fechaPago: string | null;
  estado: 'PENDIENTE' | 'PARCIAL' | 'PAGADO' | 'VENCIDO';
  metodo: string | null;
}

/** Reflejo de AbonoDTO. */
export interface Abono {
  id: number;
  monto: number;
  fecha: string;
  metodo: string;
  registradoPorNombre: string | null;
}

export interface AbonoRequest {
  monto: number;
  metodo: string;
}

export interface NuevaCuotaRequest {
  matriculaId: number;
  alumnoId: number;
  concepto: string;
  monto: number;
  fechaVencimiento: string;
}
