import { prisma } from "@/lib/prisma";

export async function obtenerPenalizacionPendiente(usuarioId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      email: true,
    },
  });

/** 
    * MOCK TEMPORAL:
   * Para probar cómo se vería la penalización en rojo.
   * Después esto debería venir de una tabla real de penalizaciones.
   */
  if (usuario?.email === "cliente@sportify.com") {
    return {
      monto: 2500,
      motivo: "Penalización por inasistencia a una clase reservada",
    };
  }

  return null;
}

export type PenalizacionCancelacion = {
  titulo: string;
  descripcion: string;
};

export type RecargoFuturo = {
  titulo: string;
  descripcion: string;
};

/**
 * TODO: reglas reales de penalización por cancelar una inscripción.
 * Por ahora devuelve datos de ejemplo para armar la pantalla de confirmación;
 * reemplazar esta lógica cuando se definan las reglas definitivas
 * (ej: según horas de anticipación, cantidad de cancelaciones previas, tipo de abono, etc).
 */
export async function obtenerInfoCancelacion(_: {
  usuarioId: number;
  claseId: number;
}): Promise<{
  penalizaciones: PenalizacionCancelacion[];
  recargosFuturos: RecargoFuturo[];
}> {
  return {
    penalizaciones: [
      {
        titulo: "Penalización por cancelación tardía (ejemplo)",
        descripcion:
          "Cancelar con menos de 12 horas de anticipación puede generar un cargo de $1.000.",
      },
    ],
    recargosFuturos: [
      {
        titulo: "Recargo por cancelaciones reiteradas (ejemplo)",
        descripcion:
          "A partir de la 3ra cancelación en el mes, se aplica un recargo del 10% en tu próxima inscripción.",
      },
    ],
  };
}