"use server";

import { prisma } from "@/lib/prisma";
import { requerirRol } from "@/lib/sesion";

export async function obtenerClasesFiltradas(fechaInicioIso: string, fechaFinIso: string) {
  await requerirRol(["ADMIN"]);
  
  const clases = await prisma.clase.findMany({
    where: {
      fechaHora: {
        gte: new Date(fechaInicioIso),
        lte: new Date(fechaFinIso),
      }
    },
    include: {
      disciplina: { select: { nombre: true } },
      profesor: { select: { nombre: true, apellido: true } },
    },
    orderBy: { fechaHora: "asc" },
  });
  
  return clases;
}
