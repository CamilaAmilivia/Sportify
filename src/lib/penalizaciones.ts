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