import fs from "fs";
import path from "path";
import { PrismaClient } from "../../src/generated/prisma/client";

export async function createCuentasDemo(prisma: PrismaClient) {
  console.log("👤 Creando cuentas de demo para el Sprint 2...");
  
  const demoDataPath = path.join(process.cwd(), "prisma", "sprint2", "demo-cuentas.json");
  
  if (!fs.existsSync(demoDataPath)) {
    console.warn("⚠️ No se encontró el archivo prisma/sprint2/demo-cuentas.json. No se crearán cuentas de demo adicionales.");
    return { clientes: [], profesores: [] };
  }

  const rawData = fs.readFileSync(demoDataPath, "utf-8");
  const data = JSON.parse(rawData);
  const usersClientes = data.clientes || [];
  const usersProfesores = data.profesores || [];

  console.log(`Insertando ${usersClientes.length} clientes y ${usersProfesores.length} profesores desde demo-cuentas.json...`);

  const createdClientes = [];
  const createdProfesores = [];

  // Crear Clientes
  for (const user of usersClientes) {
    const { dni, nombre, apellido, email } = user;
    const createdUser = await prisma.usuario.upsert({
      where: { email },
      update: { password: "Cliente123!", rol: "CLIENTE", activo: true },
      create: { dni, nombre, apellido, email, password: "Cliente123!", fechaNac: new Date("1990-01-01"), rol: "CLIENTE", activo: true },
    });
    createdClientes.push(createdUser);
    console.log(`✅ Cliente demo creado/actualizado: ${email}`);
  }

  // Crear Profesores
  for (const user of usersProfesores) {
    const { dni, nombre, apellido, email } = user;
    const createdUser = await prisma.usuario.upsert({
      where: { email },
      update: { password: "Profesor123!", rol: "PROFESOR", activo: true },
      create: { dni, nombre, apellido, email, password: "Profesor123!", fechaNac: new Date("1990-01-01"), rol: "PROFESOR", activo: true },
    });
    createdProfesores.push(createdUser);
    console.log(`✅ Profesor demo creado/actualizado: ${email}`);
  }

  return { clientes: createdClientes, profesores: createdProfesores };
}
