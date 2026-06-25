import { prisma } from "@/lib/prisma";

export async function obtenerCreditosDisponibles(usuarioId: number) {
  return prisma.creditoClase.count({
    where: { usuarioId, usado: false },
  });
}

export async function otorgarCreditoClase({
  usuarioId,
  claseOrigenId,
  motivo,
}: {
  usuarioId: number;
  claseOrigenId: number;
  motivo: string;
}) {
  return prisma.creditoClase.create({
    data: {
      usuarioId,
      claseOrigenId,
      motivo,
    },
  });
}

/**
 * Toma el crédito más antiguo sin usar del usuario y lo marca como usado
 * para la clase indicada. Lanza error si no tiene créditos disponibles.
 */
export async function usarCreditoClase({
  usuarioId,
  claseUsadaId,
}: {
  usuarioId: number;
  claseUsadaId: number;
}) {
  const credito = await prisma.creditoClase.findFirst({
    where: { usuarioId, usado: false },
    orderBy: { createdAt: "asc" },
  });

  if (!credito) {
    throw new Error("No tenés créditos de clase gratis disponibles.");
  }

  await prisma.creditoClase.update({
    where: { id: credito.id },
    data: {
      usado: true,
      usadoEn: new Date(),
      claseUsadaId,
    },
  });

  return credito;
}
