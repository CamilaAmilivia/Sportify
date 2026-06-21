import { prisma } from "@/lib/prisma";

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

    const primero = await prisma.listaEspera.findFirst({
      where: { claseId: entrada.claseId },
      orderBy: { posicion: "asc" },
    });

    if (primero?.usuarioId !== usuarioId) {
      continue;
    }

    const ocupados = await prisma.inscripcion.count({
      where: { claseId: entrada.claseId, estado: "ACTIVA" },
    });

    if (ocupados < entrada.clase.cupoMaximo) {
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
