export const TIPOS_PAGO = {
  MENSUALIDAD: "MENSUALIDAD",
  CLASE_INDIVIDUAL: "CLASE_INDIVIDUAL",
} as const;

export type TipoPagoSportify = (typeof TIPOS_PAGO)[keyof typeof TIPOS_PAGO];

export const PRECIO_ABONO_MENSUAL = 15000;

export function normalizarTipoPago(tipoPago: unknown): TipoPagoSportify {
  if (tipoPago === TIPOS_PAGO.MENSUALIDAD) {
    return TIPOS_PAGO.MENSUALIDAD;
  }

  return TIPOS_PAGO.CLASE_INDIVIDUAL;
}

export function obtenerFinDeMes(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth() + 1, 0, 23, 59, 59);
}

export function esMismoDiaYHorario(fechaBase: Date, fechaComparar: Date) {
  return (
    fechaBase.getDay() === fechaComparar.getDay() &&
    fechaBase.getHours() === fechaComparar.getHours() &&
    fechaBase.getMinutes() === fechaComparar.getMinutes()
  );
}

export function obtenerInicioDeMes(fecha: Date) {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1, 0, 0, 0);
}

export function calcularPrecioAbonoProporcional({
  precioMensual,
  totalClasesDelMes,
  clasesRestantesDelMes,
}: {
  precioMensual: number;
  totalClasesDelMes: number;
  clasesRestantesDelMes: number;
}) {
  if (totalClasesDelMes <= 0 || clasesRestantesDelMes <= 0) {
    return precioMensual;
  }

  return Math.round((precioMensual / totalClasesDelMes) * clasesRestantesDelMes);
}