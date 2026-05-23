import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const ahora = new Date();
  
  // Buscar al profesor específico de prueba
  const profesor = await prisma.usuario.findFirst({
    where: { email: "profesor@sportify.com" }
  });

  // Buscar una disciplina
  const disciplina = await prisma.disciplina.findFirst();

  if (!profesor || !disciplina) {
    console.log("No hay profesor o disciplina. Corré el seed normal primero.");
    return;
  }

  // Limpiar clases de prueba anteriores
  const clasesAnteriores = await prisma.clase.findMany({
    where: { titulo: "Clase de Prueba QR" }
  });

  for (const c of clasesAnteriores) {
    await prisma.inscripcion.deleteMany({ where: { claseId: c.id } });
    await prisma.asistencia.deleteMany({ where: { claseId: c.id } });
    await prisma.clase.delete({ where: { id: c.id } });
  }

  // Crear clase para AHORA
  const claseTest = await prisma.clase.create({
    data: {
      titulo: "Clase de Prueba QR",
      descripcion: "Clase para probar el escáner ahora mismo",
      fechaHora: ahora,
      duracionMin: 60,
      cupoMaximo: 10,
      precio: 0,
      estado: "ACTIVA",
      disciplinaId: disciplina.id,
      profesorId: profesor.id,
    }
  });

  // Inscribir a TODOS los clientes (para que el nuevo usuario también pueda probarlo)
  const clientes = await prisma.usuario.findMany({
    where: { rol: "CLIENTE" }
  });

  for (const cliente of clientes) {
    await prisma.inscripcion.create({
      data: {
        usuarioId: cliente.id,
        claseId: claseTest.id,
        estado: "ACTIVA"
      }
    });
  }

  console.log(`✅ Creada clase "Clase de Prueba QR" para AHORA (ID: ${claseTest.id})`);
  console.log(`✅ Inscriptos ${clientes.length} clientes en esta clase para que puedas probar.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
