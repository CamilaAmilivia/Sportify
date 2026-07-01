import { prisma } from "@/lib/prisma";
import { otorgarCreditoClase } from "@/lib/creditos";

const HORAS_LIMITE_INDIVIDUAL = 24;
const HORAS_LIMITE_ABONO = 48;
const PORCENTAJE_RECARGO = 30;
const CANCELACIONES_PARA_RECARGO_ABONO = 3;

export type PenalizacionCancelacion = {
  titulo: string;
  descripcion: string;
};

function formatearFecha(fecha: Date) {
  return fecha.toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function horasHastaClase(fechaHora: Date) {
  return (fechaHora.getTime() - Date.now()) / (60 * 60 * 1000);
}

async function obtenerContextoCancelacion(inscripcionId: number) {
  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionId },
    include: { clase: true, pago: true },
  });

  if (!inscripcion) {
    throw new Error("No se encontró la inscripción.");
  }

  const esAbono = inscripcion.pago?.tipo === "MENSUALIDAD";
  const horas = horasHastaClase(inscripcion.clase.fechaHora);

  return { inscripcion, esAbono, horas };
}

/**
 * Vista previa (sin aplicar nada) de la penalización que correspondería si
 * se confirma la cancelación de esta inscripción, según las reglas:
 * - Individual, cancela con +24hs de anticipación: sin penalización.
 * - Individual, cancela con -24hs: recargo del 30% en su próxima clase individual.
 * - Abono, cancela con +48hs: reintegro (sin penalización).
 * - Abono, cancela con -48hs: a la 3ra vez, recargo del 30% en su próximo
 *   abono y pierde la clase cancelada (sin reintegro).
 * Devuelve null si la cancelación no genera ninguna penalización.
 */
export async function obtenerInfoCancelacion(
  inscripcionId: number
): Promise<PenalizacionCancelacion | null> {
  const { inscripcion, esAbono, horas } = await obtenerContextoCancelacion(
    inscripcionId
  );

  const fecha = formatearFecha(inscripcion.clase.fechaHora);

  if (esAbono) {
    if (horas >= HORAS_LIMITE_ABONO) {
      return null;
    }

    const cancelacionesTardias = await prisma.penalizacion.count({
      where: {
        usuarioId: inscripcion.usuarioId,
        tipo: "AVISO_CANCELACION_TARDIA_ABONO",
      },
    });

    const seraLaQueGeneraRecargo =
      (cancelacionesTardias + 1) % CANCELACIONES_PARA_RECARGO_ABONO === 0;

    return {
      titulo: "Cancelación tardía de abono",
      descripcion: seraLaQueGeneraRecargo
        ? `Cancelás "${inscripcion.clase.titulo}" del ${fecha} con menos de ${HORAS_LIMITE_ABONO}hs de anticipación. Esta es tu ${cancelacionesTardias + 1}ª cancelación tardía: se aplicará un recargo del ${PORCENTAJE_RECARGO}% en tu próximo abono mensual y no se reintegra esta clase.`
        : `Cancelás "${inscripcion.clase.titulo}" del ${fecha} con menos de ${HORAS_LIMITE_ABONO}hs de anticipación. No se reintegra esta clase. Llevás ${cancelacionesTardias + 1} de ${CANCELACIONES_PARA_RECARGO_ABONO} cancelaciones tardías: al llegar a ${CANCELACIONES_PARA_RECARGO_ABONO} se aplica un recargo del ${PORCENTAJE_RECARGO}% en tu próximo abono.`,
    };
  }

  if (horas >= HORAS_LIMITE_INDIVIDUAL) {
    return {
      titulo: "Reintegro por cancelación",
      descripcion: `Cancelás "${inscripcion.clase.titulo}" del ${fecha} con más de ${HORAS_LIMITE_INDIVIDUAL}hs de anticipación. El reintegro del importe abonado se realizará en persona en el local.`,
    };
  }

  return {
    titulo: "Cancelación fuera de término",
    descripcion: `Cancelás "${inscripcion.clase.titulo}" del ${fecha} con menos de ${HORAS_LIMITE_INDIVIDUAL}hs de anticipación: se aplicará un recargo del ${PORCENTAJE_RECARGO}% en tu próxima compra de clase individual.`,
  };
}

/**
 * Aplica (persiste) las penalizaciones que correspondan al cancelar una
 * inscripción, según el mismo criterio que obtenerInfoCancelacion.
 * Se debe llamar una sola vez, en el momento en que se confirma la
 * cancelación (después de marcar la inscripción como CANCELADA).
 */
export async function aplicarPenalizacionPorCancelacion(inscripcionId: number) {
  const { inscripcion, esAbono, horas } = await obtenerContextoCancelacion(
    inscripcionId
  );

  const fecha = formatearFecha(inscripcion.clase.fechaHora);

  if (esAbono) {
    if (horas >= HORAS_LIMITE_ABONO) {
      await otorgarCreditoClase({
        usuarioId: inscripcion.usuarioId,
        claseOrigenId: inscripcion.claseId,
        motivo: `Reintegro por cancelar "${inscripcion.clase.titulo}" del ${fecha} con más de ${HORAS_LIMITE_ABONO}hs de anticipación.`,
      });

      return;
    }

    await prisma.penalizacion.create({
      data: {
        usuarioId: inscripcion.usuarioId,
        claseId: inscripcion.claseId,
        tipo: "AVISO_CANCELACION_TARDIA_ABONO",
        porcentaje: 0,
        motivo: `Cancelación tardía (menos de ${HORAS_LIMITE_ABONO}hs) de "${inscripcion.clase.titulo}" del ${fecha}.`,
      },
    });

    const cancelacionesTardias = await prisma.penalizacion.count({
      where: {
        usuarioId: inscripcion.usuarioId,
        tipo: "AVISO_CANCELACION_TARDIA_ABONO",
      },
    });

    if (cancelacionesTardias % CANCELACIONES_PARA_RECARGO_ABONO === 0) {
      await prisma.penalizacion.create({
        data: {
          usuarioId: inscripcion.usuarioId,
          claseId: inscripcion.claseId,
          tipo: "RECARGO_ABONO",
          porcentaje: PORCENTAJE_RECARGO,
          motivo: `Recargo del ${PORCENTAJE_RECARGO}% por acumular ${CANCELACIONES_PARA_RECARGO_ABONO} cancelaciones tardías de abono (la última, de "${inscripcion.clase.titulo}" del ${fecha}).`,
        },
      });
    }

    return;
  }

  if (horas >= HORAS_LIMITE_INDIVIDUAL) {
    return;
  }

  await prisma.penalizacion.create({
    data: {
      usuarioId: inscripcion.usuarioId,
      claseId: inscripcion.claseId,
      tipo: "RECARGO_CLASE_INDIVIDUAL",
      porcentaje: PORCENTAJE_RECARGO,
      motivo: `Recargo del ${PORCENTAJE_RECARGO}% por cancelar "${inscripcion.clase.titulo}" del ${fecha} con menos de ${HORAS_LIMITE_INDIVIDUAL}hs de anticipación.`,
    },
  });
}

/**
 * Devuelve la penalización de recargo vigente (sin aplicar todavía) para el
 * tipo de compra indicado, si existe.
 */
export async function obtenerRecargoVigente(
  usuarioId: number,
  tipoCompra: "CLASE_INDIVIDUAL" | "MENSUALIDAD"
) {
  const tipos: ("RECARGO_ABONO" | "RECARGO_CLASE_INDIVIDUAL" | "RECARGO_AUSENCIA_INDIVIDUAL")[] =
    tipoCompra === "MENSUALIDAD"
      ? ["RECARGO_ABONO"]
      : ["RECARGO_CLASE_INDIVIDUAL", "RECARGO_AUSENCIA_INDIVIDUAL"];

  return prisma.penalizacion.findFirst({
    where: {
      usuarioId,
      tipo: { in: tipos },
      aplicada: false,
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Aplica penalización por ausencia a una clase ya finalizada.
 * Solo se debe llamar cuando Asistencia.presente === false (profesor marcó ausente).
 * Usa la misma lógica que cancelación tardía según el tipo de pago.
 * Es idempotente: no aplica dos veces para la misma clase.
 */
export async function aplicarPenalizacionPorAusencia(inscripcionId: number) {
  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionId },
    include: { clase: true, pago: true },
  });

  if (!inscripcion) return;

  const esAbono = inscripcion.pago?.tipo === "MENSUALIDAD";
  const fecha = formatearFecha(inscripcion.clase.fechaHora);
  const tipoAusencia = esAbono ? "AVISO_AUSENCIA_ABONO" : "RECARGO_AUSENCIA_INDIVIDUAL";

  const yaAplicada = await prisma.penalizacion.findFirst({
    where: { usuarioId: inscripcion.usuarioId, claseId: inscripcion.claseId, tipo: tipoAusencia },
  });

  if (yaAplicada) return;

  if (esAbono) {
    await prisma.penalizacion.create({
      data: {
        usuarioId: inscripcion.usuarioId,
        claseId: inscripcion.claseId,
        tipo: "AVISO_AUSENCIA_ABONO",
        porcentaje: 0,
        motivo: `Ausencia a "${inscripcion.clase.titulo}" del ${fecha} (abono mensual).`,
      },
    });

    const avisosAusencia = await prisma.penalizacion.count({
      where: { usuarioId: inscripcion.usuarioId, tipo: "AVISO_AUSENCIA_ABONO" },
    });

    if (avisosAusencia % CANCELACIONES_PARA_RECARGO_ABONO === 0) {
      await prisma.penalizacion.create({
        data: {
          usuarioId: inscripcion.usuarioId,
          claseId: inscripcion.claseId,
          tipo: "RECARGO_ABONO",
          porcentaje: PORCENTAJE_RECARGO,
          motivo: `Recargo del ${PORCENTAJE_RECARGO}% por acumular ${CANCELACIONES_PARA_RECARGO_ABONO} ausencias en clases de abono (la última, "${inscripcion.clase.titulo}" del ${fecha}).`,
        },
      });
    }
  } else {
    await prisma.penalizacion.create({
      data: {
        usuarioId: inscripcion.usuarioId,
        claseId: inscripcion.claseId,
        tipo: "RECARGO_AUSENCIA_INDIVIDUAL",
        porcentaje: PORCENTAJE_RECARGO,
        motivo: `Recargo del ${PORCENTAJE_RECARGO}% por ausencia a "${inscripcion.clase.titulo}" del ${fecha} (clase individual).`,
      },
    });
  }
}

export async function marcarPenalizacionAplicada(penalizacionId: number) {
  await prisma.penalizacion.update({
    where: { id: penalizacionId },
    data: { aplicada: true },
  });
}
