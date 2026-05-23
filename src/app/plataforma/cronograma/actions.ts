'use server'

import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek } from 'date-fns'

export async function getClasesSemana(fecha: Date) {
  const inicio = startOfWeek(fecha, { weekStartsOn: 1 })
  const fin = endOfWeek(fecha, { weekStartsOn: 1 })

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