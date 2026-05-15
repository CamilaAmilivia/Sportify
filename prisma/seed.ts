import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@sportify.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const adminDni = Number(process.env.ADMIN_DNI ?? "99999999");

  const admin = await prisma.usuario.upsert({
    where: {
      email: adminEmail,
    },
    update: {
      password: adminPassword,
      rol: "ADMIN",
      activo: true,
    },
    create: {
      dni: adminDni,
      nombre: "Admin",
      apellido: "Sportify",
      email: adminEmail,
      password: adminPassword,
      fechaNac: new Date("2000-01-01"),
      aptoFisico: null,
      rol: "ADMIN",
      activo: true,
    },
  });

  console.log("Admin creado/actualizado:");
  console.log({
    id: admin.id,
    email: admin.email,
    rol: admin.rol,
  });

  console.log("Credenciales para iniciar sesión:");
  console.log({
    email: adminEmail,
    password: adminPassword,
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });