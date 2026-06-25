'use server'

import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek } from 'date-fns'
import { requerirUsuarioActual } from '@/lib/sesion'
import { revalidatePath } from 'next/cache'

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

  if (clase._count.inscripciones < clase.cupoMaximo) {
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