import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

import { clearDatabase } from "./sprint2/clear";
import { createCuentasDemo } from "./sprint2/cuentas";
import { createClasesSprint2 } from "./sprint2/clases";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🚀 Iniciando Seed para el Sprint 2...");

  // 1. Limpiar base de datos
  await clearDatabase(prisma);

  // 2. Crear Disciplinas base para las clases
  const discFuncional = await prisma.disciplina.create({
    data: { nombre: "Funcional", descripcion: "Entrenamiento funcional", activa: true }
  });
  const discYoga = await prisma.disciplina.create({
    data: { nombre: "Yoga", descripcion: "Yoga budista", activa: true }
  });
  const discPilates = await prisma.disciplina.create({
    data: { nombre: "Pilates", descripcion: "Pilates con pilas", activa: true }
  });

  const disciplinas = [discFuncional, discYoga, discPilates];

  // 3. Crear Admin base (Opcional pero recomendado para poder entrar al sistema)
  const admin = await prisma.usuario.create({
    data: {
      dni: 99999999,
      nombre: "Admin",
      apellido: "Sportify",
      email: "admin@sportify.com",
      password: "Admin123!",
      fechaNac: new Date("1990-01-01"),
      rol: "ADMIN",
      activo: true,
    }
  });
  console.log(`✅ Admin base creado: ${admin.email}`);

  // 4. Módulo: Crear cuentas demo (clientes y profesores desde JSON)
  const { clientes, profesores } = await createCuentasDemo(prisma);

  if (profesores.length < 3) {
    console.error("❌ ERROR: El archivo demo-cuentas.json debe tener al menos 3 profesores para poder asignar las clases.");
    process.exit(1);
  }

  // Extraer IDs para inscribirlos
  const clientesIds = clientes.map(c => c.id);

  if (clientesIds.length === 0) {
    console.warn("⚠️ No se crearon clientes, por lo que las clases de QR quedarán sin inscriptos.");
  }

  // 5. Módulo: Crear clases (agrupa todas las creaciones de clases)
  await createClasesSprint2(prisma, profesores, disciplinas, clientesIds);

  console.log("🎉 Seed Sprint 2 finalizado exitosamente.");
}

main()
  .catch((error) => {
    console.error("❌ Error durante el seed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
