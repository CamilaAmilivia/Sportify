import { PrismaClient } from "../../src/generated/prisma/client";

export async function clearDatabase(prisma: PrismaClient) {
  console.log("🧹 Borrando datos preexistentes...");
  
  // El orden es importante para no violar las foreign keys
  await prisma.asistencia.deleteMany();
  await prisma.inscripcion.deleteMany();
  await prisma.listaEspera.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.penalizacion.deleteMany();
  await prisma.creditoClase.deleteMany();
  await prisma.clase.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  
  // Opcionalmente borrar usuarios y disciplinas
  await prisma.usuario.deleteMany();
  await prisma.disciplina.deleteMany();

  console.log("✅ Base de datos limpiada.");
}
