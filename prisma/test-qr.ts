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

  const cliente = await prisma.usuario.findFirst({
    where: { email: "cliente@sportify.com" }
  });

  if (!profesor || !disciplina || !cliente) {
    console.log("No hay profesor, disciplina o cliente. Corré el seed normal primero.");
    return;
  }

  // Limpiar clases de prueba anteriores
  const clasesAnteriores = await prisma.clase.findMany({
    where: { 
      titulo: {
        in: ["Clase Tarde QR", "Clase Ahora QR", "Clase Temprano QR", "Clase de Prueba QR"]
      } 
    }
  });

  for (const c of clasesAnteriores) {
    await prisma.inscripcion.deleteMany({ where: { claseId: c.id } });
    await prisma.asistencia.deleteMany({ where: { claseId: c.id } });
    await prisma.clase.delete({ where: { id: c.id } });
  }

  const horaTarde = new Date(ahora.getTime() - 2 * 60 * 60 * 1000); // 2 horas antes
  const horaAhora = new Date(ahora.getTime());
  const horaTemprano = new Date(ahora.getTime() + 2 * 60 * 60 * 1000); // 2 horas después

  // 1. Clase donde es muy tarde tomar asistencia
  const claseTarde = await prisma.clase.create({
    data: {
      titulo: "Clase Tarde QR",
      descripcion: "Muy tarde para asistencia",
      fechaHora: horaTarde,
      duracionMin: 60,
      cupoMaximo: 10,
      precio: 0,
      estado: "ACTIVA",
      disciplinaId: disciplina.id,
      profesorId: profesor.id,
    }
  });

  // 2. Clase donde es posible tomar asistencia
  const claseAhora = await prisma.clase.create({
    data: {
      titulo: "Clase Ahora QR",
      descripcion: "Posible tomar asistencia",
      fechaHora: horaAhora,
      duracionMin: 60,
      cupoMaximo: 10,
      precio: 0,
      estado: "ACTIVA",
      disciplinaId: disciplina.id,
      profesorId: profesor.id,
    }
  });

  // 3. Clase donde es muy temprano para tomar asistencia
  const claseTemprano = await prisma.clase.create({
    data: {
      titulo: "Clase Temprano QR",
      descripcion: "Muy temprano para asistencia",
      fechaHora: horaTemprano,
      duracionMin: 60,
      cupoMaximo: 10,
      precio: 0,
      estado: "ACTIVA",
      disciplinaId: disciplina.id,
      profesorId: profesor.id,
    }
  });

  const clases = [claseTarde, claseAhora, claseTemprano];

  // Inscribir SOLO al cliente preconfigurado en las tres clases
  for (const clase of clases) {
    await prisma.inscripcion.create({
      data: {
        usuarioId: cliente.id,
        claseId: clase.id,
        estado: "ACTIVA"
      }
    });
  }

  console.log(`✅ Creada clase "Clase Tarde QR" (-2 hrs, ID: ${claseTarde.id})`);
  console.log(`✅ Creada clase "Clase Ahora QR" (AHORA, ID: ${claseAhora.id})`);
  console.log(`✅ Creada clase "Clase Temprano QR" (+2 hrs, ID: ${claseTemprano.id})`);
  console.log(`✅ Inscripto cliente@sportify.com como único cliente en estas 3 clases.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
