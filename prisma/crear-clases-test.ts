import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const profesor = await prisma.usuario.findFirst({ where: { rol: "PROFESOR" } });
  const disciplina = await prisma.disciplina.findFirst();
  const clientes = await prisma.usuario.findMany({ where: { rol: "CLIENTE" }, take: 2 });

  if (!profesor || !disciplina || clientes.length < 2) {
    console.log("Faltan datos básicos. Asegúrate de haber corrido el seed primero.");
    return;
  }

  const clase1 = await prisma.clase.create({
    data: {
      titulo: "Test >24hs",
      descripcion: "Clase llena para probar confirmación exitosa",
      fechaHora: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
      duracionMin: 60,
      cupoMaximo: 2,
      precio: 1500,
      estado: "ACTIVA",
      disciplinaId: disciplina.id,
      profesorId: profesor.id,
    },
  });

  const clase2 = await prisma.clase.create({
    data: {
      titulo: "Test <24hs",
      descripcion: "Clase llena para probar fallo por tiempo límite",
      fechaHora: new Date(Date.now() + 12 * 60 * 60 * 1000), 
      duracionMin: 60,
      cupoMaximo: 2,
      precio: 1500,
      estado: "ACTIVA",
      disciplinaId: disciplina.id,
      profesorId: profesor.id,
    },
  });

  for (const cliente of clientes) {
    await prisma.inscripcion.create({ data: { usuarioId: cliente.id, claseId: clase1.id, estado: "ACTIVA" } });
    await prisma.inscripcion.create({ data: { usuarioId: cliente.id, claseId: clase2.id, estado: "ACTIVA" } });
  }

  console.log("¡Clases de prueba creadas y llenadas con éxito!");
  console.log("1. 'Test >24hs' -> Ocurre en 3 días (Cupo 2/2)");
  console.log("2. 'Test <24hs' -> Ocurre en 12 horas (Cupo 2/2)");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
