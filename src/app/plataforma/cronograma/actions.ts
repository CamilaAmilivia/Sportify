'use server'

import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek } from 'date-fns'
import { requerirUsuarioActual } from '@/lib/sesion'
import { revalidatePath } from 'next/cache'
import { obtenerCuposDisponiblesPublico, limpiarNotificacionesVencidas } from '@/lib/listaEspera'

export async function getClasesSemana(fecha: Date) {
const inicio = startOfWeek(fecha, { weekStartsOn: 1 })
inicio.setUTCHours(0, 0, 0, 0)

const fin = new Date(inicio)
fin.setUTCDate(fin.getUTCDate() + 6)
fin.setUTCHours(23, 59, 59, 999)

// Ajuste zona horaria Argentina (UTC-3)

  const clases = await prisma.clase.findMany({
    where: {
      fechaHora: {
        gte: inicio,
        lte: fin,
      },
      estado: 'ACTIVA',
    },
    include: {
      profesor: {
        select: { nombre: true, apellido: true },
      },
      disciplina: {
        select: { nombre: true },
      },
      _count: {
        select: {
          inscripciones: {
            where: { estado: 'ACTIVA' },
          },
        },
      },
    },
    orderBy: { fechaHora: 'asc' },
  })

  return clases
}

export async function anotarseListaEspera(claseId: number) {
  const usuario = await requerirUsuarioActual()

  const clase = await prisma.clase.findUnique({
    where: { id: claseId },
    include: {
      _count: {
        select: { inscripciones: { where: { estado: 'ACTIVA' } } },
      },
    },
  })

  if (!clase) {
    throw new Error('La clase no existe.')
  }

  const disponiblesReales = await obtenerCuposDisponiblesPublico(claseId)

  if (disponiblesReales > 0) {
    throw new Error('La clase todavía tiene cupos disponibles.')
  }

  const yaInscripto = await prisma.inscripcion.findUnique({
    where: { usuarioId_claseId: { usuarioId: usuario.id, claseId } },
  })

  if (yaInscripto?.estado === 'ACTIVA') {
    throw new Error('Ya estás inscripto en esta clase.')
  }

  const yaEnListaEspera = await prisma.listaEspera.findUnique({
    where: { usuarioId_claseId: { usuarioId: usuario.id, claseId } },
  })

  if (yaEnListaEspera) {
    return yaEnListaEspera
  }

  const ultimaPosicion = await prisma.listaEspera.aggregate({
    where: { claseId },
    _max: { posicion: true },
  })

  const proximaPosicion = (ultimaPosicion._max.posicion ?? 0) + 1

  const entrada = await prisma.listaEspera.create({
    data: {
      usuarioId: usuario.id,
      claseId,
      tipo: 'CLASE_INDIVIDUAL',
      posicion: proximaPosicion,
    },
  })

  revalidatePath('/plataforma/cronograma')
  revalidatePath('/plataforma/mis-clases')

  return entrada
}

export async function inscribirseConCredito(claseId: number) {
  const usuario = await requerirUsuarioActual()

  const clase = await prisma.clase.findUnique({ where: { id: claseId } })

  if (!clase) {
    throw new Error('La clase no existe.')
  }

  const yaInscripto = await prisma.inscripcion.findUnique({
    where: { usuarioId_claseId: { usuarioId: usuario.id, claseId } },
  })

  if (yaInscripto?.estado === 'ACTIVA') {
    throw new Error('Ya estás inscripto en esta clase.')
  }

  await limpiarNotificacionesVencidas(claseId)

  const ahora = new Date()

  const inscriptos = await prisma.inscripcion.count({
    where: { claseId, estado: 'ACTIVA' },
  })

  const reservasPendientes = await prisma.pago.count({
    where: { claseId, estado: 'PENDIENTE', reservaHasta: { gt: ahora } },
  })

  const lugaresOcupados = inscriptos + reservasPendientes
  const librestotal = clase.cupoMaximo - lugaresOcupados

  if (librestotal <= 0) {
    throw new Error('No hay cupo disponible para esta clase.')
  }

  const miEntradaListaEspera = await prisma.listaEspera.findUnique({
    where: { usuarioId_claseId: { usuarioId: usuario.id, claseId } },
  })

  if (miEntradaListaEspera) {
    if (miEntradaListaEspera.posicion > librestotal) {
      throw new Error('Todavía no te toca confirmar tu lugar en la lista de espera.')
    }
  } else {
    const enEspera = await prisma.listaEspera.count({ where: { claseId } })
    if (librestotal - enEspera <= 0) {
      throw new Error(
        'Esta clase tiene lista de espera. Anotate para confirmar tu lugar cuando se libere un cupo.'
      )
    }
  }

  await prisma.$transaction(async (tx) => {
    const credito = await tx.creditoClase.findFirst({
      where: { usuarioId: usuario.id, usado: false },
      orderBy: { createdAt: 'asc' },
    })

    if (!credito) {
      throw new Error('No tenés créditos de clase gratis disponibles.')
    }

    await tx.creditoClase.update({
      where: { id: credito.id },
      data: { usado: true, usadoEn: new Date(), claseUsadaId: claseId },
    })

    await tx.inscripcion.upsert({
      where: { usuarioId_claseId: { usuarioId: usuario.id, claseId } },
      update: { estado: 'ACTIVA', pagoId: null },
      create: {
        usuarioId: usuario.id,
        claseId,
        estado: 'ACTIVA',
      },
    })

    if (miEntradaListaEspera) {
      await tx.listaEspera.delete({ where: { id: miEntradaListaEspera.id } })
      await tx.listaEspera.updateMany({
        where: { claseId, posicion: { gt: miEntradaListaEspera.posicion } },
        data: { posicion: { decrement: 1 } },
      })
    }
  })

  revalidatePath('/plataforma/cronograma')
  revalidatePath('/plataforma/mis-clases')
}