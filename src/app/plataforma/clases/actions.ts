"use server";

import { revalidatePath } from "next/cache";
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

export async function eliminarClasesSimilares(claseId: number) {
  await requerirRol(["ADMIN"]);

  if (!Number.isInteger(claseId) || claseId <= 0) {
    return { error: "La clase seleccionada no es valida." };
  }

  const claseBase = await prisma.clase.findUnique({
    where: { id: claseId },
    select: {
      id: true,
      fechaHora: true,
      duracionMin: true,
      serieId: true,
      disciplinaId: true,
      profesorId: true,
    },
  });

  if (!claseBase) {
    return { error: "La clase seleccionada ya no existe." };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const finAnio = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);

  const baseHora = claseBase.fechaHora.getHours();
  const baseMinutos = claseBase.fechaHora.getMinutes();
  const baseDiaSemana = claseBase.fechaHora.getDay();

  const candidatas = await prisma.clase.findMany({
    where: {
      fechaHora: {
        gte: hoy,
        lte: finAnio,
      },
      disciplinaId: claseBase.disciplinaId,
      profesorId: claseBase.profesorId,
      duracionMin: claseBase.duracionMin,
      ...(claseBase.serieId ? { serieId: claseBase.serieId } : {}),
    },
    select: {
      id: true,
      fechaHora: true,
      serieId: true,
    },
  });

  const clasesAEliminar = candidatas.filter((clase) => {
    if (claseBase.serieId) return true;

    return (
      clase.fechaHora.getDay() === baseDiaSemana &&
      clase.fechaHora.getHours() === baseHora &&
      clase.fechaHora.getMinutes() === baseMinutos
    );
  });

  const ids = clasesAEliminar.map((clase) => clase.id);

  if (ids.length === 0) {
    return { error: "No se encontraron clases para eliminar desde hoy hasta fin de anio." };
  }

  await prisma.$transaction([
    prisma.asistencia.deleteMany({ where: { claseId: { in: ids } } }),
    prisma.listaEspera.deleteMany({ where: { claseId: { in: ids } } }),
    prisma.inscripcion.deleteMany({ where: { claseId: { in: ids } } }),
    prisma.pago.updateMany({
      where: { claseId: { in: ids } },
      data: { claseId: null },
    }),
    prisma.clase.deleteMany({ where: { id: { in: ids } } }),
  ]);

  revalidatePath("/plataforma/clases");
  revalidatePath("/plataforma/cronograma");
  revalidatePath("/plataforma/mis-clases");

  return { success: true, cantidadEliminadas: ids.length };
}
