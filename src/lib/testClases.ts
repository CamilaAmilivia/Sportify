import { prisma } from './prisma'

async function main() {
  await prisma.clase.update({
    where: { id: 1 },
    data: { fechaHora: new Date('2026-05-20T12:00:00.000Z') }
  })
  await prisma.clase.update({
    where: { id: 2 },
    data: { fechaHora: new Date('2026-05-21T09:00:00.000Z') }
  })
  await prisma.clase.update({
    where: { id: 3 },
    data: { fechaHora: new Date('2026-05-22T10:00:00.000Z') }
  })

  const clases = await prisma.clase.findMany({
    select: { id: true, fechaHora: true, titulo: true }
  })
  console.log(JSON.stringify(clases, null, 2))
}

main()