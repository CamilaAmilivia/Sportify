'use server'

import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek } from 'date-fns'

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