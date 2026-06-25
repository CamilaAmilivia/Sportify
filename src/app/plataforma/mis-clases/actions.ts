"use server";

import { prisma } from "@/lib/prisma";
import { requerirUsuarioActual } from "@/lib/sesion";
import { sendListaEsperaPromocionEmail } from "@/lib/mail";
import { obtenerInfoCancelacion } from "@/lib/penalizaciones";
import { revalidatePath } from "next/cache";

export async function obtenerConfirmacionCancelacion(inscripcionId: number) {
  const usuario = await requerirUsuarioActual();

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionId },
    include: { clase: { include: { disciplina: true } } },
  });

  if (!inscripcion || inscripcion.usuarioId !== usuario.id) {
    throw new Error("No se encontró la inscripción.");
  }

  const { penalizaciones, recargosFuturos } = await obtenerInfoCancelacion({
    usuarioId: usuario.id,
    claseId: inscripcion.claseId,
  });

  return {
    clase: {
      titulo: inscripcion.clase.titulo,
      disciplina: inscripcion.clase.disciplina.nombre,
      fechaHora: inscripcion.clase.fechaHora,
    },
    penalizaciones,
    recargosFuturos,
  };
}

export async function cancelarInscripcion(inscripcionId: number) {
  const usuario = await requerirUsuarioActual();

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionId },
    include: { clase: true },
  });

  if (!inscripcion || inscripcion.usuarioId !== usuario.id) {
    throw new Error("No se encontró la inscripción.");
  }

  if (inscripcion.estado !== "ACTIVA") {
    throw new Error("Esta inscripción ya está cancelada.");
  }

  await prisma.inscripcion.update({
    where: { id: inscripcionId },
    data: { estado: "CANCELADA" },
  });

  const primeroEnEspera = await prisma.listaEspera.findFirst({
    where: { claseId: inscripcion.claseId },
    orderBy: { posicion: "asc" },
    include: { usuario: true },
  });

  if (primeroEnEspera) {
    await sendListaEsperaPromocionEmail(
      primeroEnEspera.usuario.email,
      inscripcion.clase.titulo,
      inscripcion.clase.fechaHora
    );
  }

  revalidatePath("/plataforma/mis-clases");
  revalidatePath("/plataforma/cronograma");
}

export async function cancelarListaEspera(listaEsperaId: number) {
  const usuario = await requerirUsuarioActual();

  const entrada = await prisma.listaEspera.findUnique({
    where: { id: listaEsperaId },
  });

  if (!entrada || entrada.usuarioId !== usuario.id) {
    throw new Error("No se encontró tu lugar en la lista de espera.");
  }

  await prisma.listaEspera.delete({
    where: { id: listaEsperaId },
  });

  await prisma.listaEspera.updateMany({
    where: {
      claseId: entrada.claseId,
      posicion: { gt: entrada.posicion },
    },
    data: {
      posicion: { decrement: 1 },
    },
  });

  revalidatePath("/plataforma/mis-clases");
  revalidatePath("/plataforma/cronograma");
}
