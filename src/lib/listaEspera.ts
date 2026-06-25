import { prisma } from "@/lib/prisma";
import { sendListaEsperaPromocionEmail } from "@/lib/mail";

const HORAS_LIMITE_CONFIRMACION = 24;

/**
 * Borra de la lista de espera a quienes fueron notificados hace más de
 * HORAS_LIMITE_CONFIRMACION horas y no confirmaron (pagaron) a tiempo, y
 * renumera las posiciones restantes para que queden sin huecos.
 */
export async function limpiarNotificacionesVencidas(claseId: number) {
  const limite = new Date(Date.now() - HORAS_LIMITE_CONFIRMACION * 60 * 60 * 1000);

  const vencidas = await prisma.listaEspera.findMany({
    where: {
      claseId,
      notificadoEn: { lte: limite },
    },
  });

  if (vencidas.length === 0) {
    return;
  }

  await prisma.listaEspera.deleteMany({
    where: { id: { in: vencidas.map((v) => v.id) } },
  });

  await renumerarListaEspera(claseId);
}

/**
 * Reasigna las posiciones de la lista de espera de una clase de forma
 * secuencial (1, 2, 3...) según el orden de posición actual, sin huecos.
 */
export async function renumerarListaEspera(claseId: number) {
  const restantes = await prisma.listaEspera.findMany({
    where: { claseId },
    orderBy: { posicion: "asc" },
  });

  await prisma.$transaction(
    restantes.map((entrada, indice) =>
      prisma.listaEspera.update({
        where: { id: entrada.id },
        data: { posicion: indice + 1 },
      })
    )
  );
}

async function contarLugaresOcupados(claseId: number) {
  const ocupados = await prisma.inscripcion.count({
    where: { claseId, estado: "ACTIVA" },
  });

  const reservasPendientes = await prisma.pago.count({
    where: { claseId, estado: "PENDIENTE", reservaHasta: { gt: new Date() } },
  });

  return ocupados + reservasPendientes;
}

/**
 * Calcula cuántos cupos quedan realmente disponibles para el público en
 * general, reservando lugares para las personas que ya están en la lista
 * de espera (en orden de prioridad) y para pagos pendientes en curso.
 */
export async function obtenerCuposDisponiblesPublico(claseId: number) {
  const clase = await prisma.clase.findUnique({ where: { id: claseId } });

  if (!clase) {
    return 0;
  }

  await limpiarNotificacionesVencidas(claseId);

  const libres = clase.cupoMaximo - (await contarLugaresOcupados(claseId));

  if (libres <= 0) {
    return 0;
  }

  const enEspera = await prisma.listaEspera.count({ where: { claseId } });

  return Math.max(0, libres - enEspera);
}

/**
 * Notifica (mail + marca notificadoEn) a todas las personas de la lista de
 * espera que recién quedaron habilitadas a confirmar su inscripción, según
 * los cupos libres actuales.
 */
export async function notificarElegiblesListaEspera(claseId: number) {
  const clase = await prisma.clase.findUnique({ where: { id: claseId } });

  if (!clase) {
    return;
  }

  await limpiarNotificacionesVencidas(claseId);

  const libres = clase.cupoMaximo - (await contarLugaresOcupados(claseId));

  if (libres <= 0) {
    return;
  }

  const elegiblesSinNotificar = await prisma.listaEspera.findMany({
    where: {
      claseId,
      posicion: { lte: libres },
      notificadoEn: null,
    },
    include: { usuario: true },
  });

  for (const entrada of elegiblesSinNotificar) {
    await prisma.listaEspera.update({
      where: { id: entrada.id },
      data: { notificadoEn: new Date() },
    });

    await sendListaEsperaPromocionEmail(
      entrada.usuario.email,
      clase.titulo,
      clase.fechaHora
    );
  }
}
