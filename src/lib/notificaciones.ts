import { prisma } from "@/lib/prisma";
import { limpiarNotificacionesVencidas } from "@/lib/listaEspera";

export type NotificacionCupoLiberado = {
  claseId: number;
  titulo: string;
  fechaHora: Date;
  precio: number;
};

export async function obtenerNotificacionCupoLiberado(
  usuarioId: number
): Promise<NotificacionCupoLiberado | null> {
  const entradas = await prisma.listaEspera.findMany({
    where: { usuarioId },
    include: { clase: true },
  });

  for (const entrada of entradas) {
    if (entrada.clase.estado !== "ACTIVA") {
      continue;
    }

    await limpiarNotificacionesVencidas(entrada.claseId);

    const entradaActual = await prisma.listaEspera.findUnique({
      where: { id: entrada.id },
    });

    if (!entradaActual) {
      // Se le venció la prioridad y fue removido de la lista.
      continue;
    }

    const ocupados = await prisma.inscripcion.count({
      where: { claseId: entrada.claseId, estado: "ACTIVA" },
    });

    const libres = entrada.clase.cupoMaximo - ocupados;

    if (libres > 0 && entradaActual.posicion <= libres) {
      return {
        claseId: entrada.clase.id,
        titulo: entrada.clase.titulo,
        fechaHora: entrada.clase.fechaHora,
        precio: entrada.clase.precio,
      };
    }
  }

  return null;
}

export async function crearNotificacion(usuarioId: number, mensaje: string) {
  return prisma.notificacion.create({
    data: {
      usuarioId,
      mensaje,
    },
  });
}

export async function obtenerNotificacionesUsuario(usuarioId: number) {
  return prisma.notificacion.findMany({
    where: {
      usuarioId,
      leida: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function marcarNotificacionLeida(notificacionId: number) {
  return prisma.notificacion.update({
    where: {
      id: notificacionId,
    },
    data: {
      leida: true,
    },
  });
}
