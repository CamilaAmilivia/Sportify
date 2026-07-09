"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirRol } from "@/lib/sesion";
import { sendClaseCanceladaEmail } from "@/lib/mail";
import { TipoPago, Usuario } from "@/generated/prisma/client";

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
    titulo: true,
    fechaHora: true,
    duracionMin: true,
    serieId: true,
    disciplinaId: true,
    profesorId: true,
    profesor: {
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
      },
    },
  },
});

  if (!claseBase) {
    return { error: "La clase seleccionada ya no existe." };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const finAnio = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);

  const baseDiaSemana = claseBase.fechaHora.getDay();
  const baseHora = claseBase.fechaHora.getHours();
  const baseMinutos = claseBase.fechaHora.getMinutes();

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

  const clasesConDatos = await prisma.clase.findMany({
  where: {
    id: { in: ids },
  },
  include: {
    profesor: true,
    inscripciones: {
      include: {
        usuario: true,
        pago: true,
      },
    },
  },
});

const clientesNotificados = new Map<
  number,
  {
    usuario: Usuario;
    esAbonado: boolean;
  }
>();

for (const { usuario, esAbonado } of clientesNotificados.values()) {

  await sendClaseCanceladaEmail(
    usuario.email,
    usuario.nombre,
    claseBase.titulo,
    claseBase.fechaHora,
    esAbonado
  );

await sendClaseCanceladaEmail(
  claseBase.profesor.email,
  claseBase.profesor.nombre,
  claseBase.titulo,
  claseBase.fechaHora,
  false
);

  if (esAbonado) {
    await prisma.creditoClase.create({
      data: {
        usuarioId: usuario.id,
        motivo: `Cancelación de serie de clases: ${claseBase.titulo}`,
        claseOrigenId: claseBase.id,
        usado: false,
      },
    });
  }
}

await sendClaseCanceladaEmail(
  claseBase.profesor.email,
  claseBase.profesor.nombre,
  claseBase.titulo,
  claseBase.fechaHora,
  false
);

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
