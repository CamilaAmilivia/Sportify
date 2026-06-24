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

export async function confirmarInscripcionAbonado(listaEsperaId: number) {
  const usuario = await requerirUsuarioActual();

  const entradaLista = await prisma.listaEspera.findUnique({
    where: { id: listaEsperaId },
    include: { clase: true },
  });

  if (!entradaLista || entradaLista.usuarioId !== usuario.id) {
    throw new Error("No se encontró la solicitud en lista de espera.");
  }

  if (entradaLista.tipo !== "ABONADO") {
    throw new Error("Esta acción es exclusiva para usuarios abonados.");
  }

  const faltanMs = entradaLista.clase.fechaHora.getTime() - Date.now();
  if (faltanMs < 24 * 60 * 60 * 1000) {
    throw new Error("No se puede realizar la inscripción por límite de tiempo superado (faltan menos de 24 hs).");
  }

  // Transacción para garantizar que no se inscriba si se llena concurrentemente
  await prisma.$transaction(async (tx) => {
    const inscriptos = await tx.inscripcion.count({
      where: {
        claseId: entradaLista.claseId,
        estado: "ACTIVA",
      },
    });

    const cuposLibres = entradaLista.clase.cupoMaximo - inscriptos;

    if (cuposLibres <= 0) {
      throw new Error("La clase ya no tiene cupos disponibles.");
    }

    if (entradaLista.posicion > cuposLibres) {
      throw new Error("Todavía no es tu turno para confirmar.");
    }

    // Inscribir al usuario
    await tx.inscripcion.upsert({
      where: {
        usuarioId_claseId: {
          usuarioId: usuario.id,
          claseId: entradaLista.claseId,
        },
      },
      update: {
        estado: "ACTIVA",
        // Si tuviera pagoId asociado en ListaEspera, se lo pasamos
        pagoId: entradaLista.pagoId,
      },
      create: {
        usuarioId: usuario.id,
        claseId: entradaLista.claseId,
        estado: "ACTIVA",
        pagoId: entradaLista.pagoId,
      },
    });

    // Eliminar de lista de espera
    await tx.listaEspera.delete({
      where: { id: listaEsperaId },
    });

    // Reorganizar posiciones
    await tx.listaEspera.updateMany({
      where: {
        claseId: entradaLista.claseId,
        posicion: { gt: entradaLista.posicion },
      },
      data: {
        posicion: { decrement: 1 },
      },
    });
  });

  revalidatePath("/plataforma/mis-clases");
  revalidatePath("/plataforma/cronograma");
}
