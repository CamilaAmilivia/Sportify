import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
});

const prisma = new PrismaClient({ adapter });

async function crearClaseSiNoExiste({
  titulo,
  descripcion,
  fechaHora,
  duracionMin,
  cupoMaximo,
  precio,
  disciplinaId,
  profesorId,
}: {
  titulo: string;
  descripcion: string;
  fechaHora: Date;
  duracionMin: number;
  cupoMaximo: number;
  precio: number;
  disciplinaId: number;
  profesorId: number;
}) {
  const claseExistente = await prisma.clase.findFirst({
    where: {
      titulo,
      disciplinaId,
      profesorId,
      fechaHora,
    },
  });

  if (claseExistente) {
    return prisma.clase.update({
      where: {
        id: claseExistente.id,
      },
      data: {
        descripcion,
        duracionMin,
        cupoMaximo,
        precio,
        estado: "ACTIVA",
      },
    });
  }

  return prisma.clase.create({
    data: {
      titulo,
      descripcion,
      fechaHora,
      duracionMin,
      cupoMaximo,
      precio,
      estado: "ACTIVA",
      disciplinaId,
      profesorId,
    },
  });
}

async function crearClienteOcupanteSiNoExiste({
  dni,
  nombre,
  apellido,
  email,
}: {
  dni: number;
  nombre: string;
  apellido: string;
  email: string;
}) {
  return prisma.usuario.upsert({
    where: {
      email,
    },
    update: {
      password: "Cliente123!",
      rol: "CLIENTE",
      activo: true,
    },
    create: {
      dni,
      nombre,
      apellido,
      email,
      password: "Cliente123!",
      fechaNac: new Date("2001-01-01"),
      aptoFisico: null,
      rol: "CLIENTE",
      activo: true,
    },
  });
}

async function ocuparClaseCompleta({
  claseId,
  usuariosIds,
}: {
  claseId: number;
  usuariosIds: number[];
}) {
  for (const usuarioId of usuariosIds) {
    await prisma.inscripcion.upsert({
      where: {
        usuarioId_claseId: {
          usuarioId,
          claseId,
        },
      },
      update: {
        estado: "ACTIVA",
      },
      create: {
        usuarioId,
        claseId,
        estado: "ACTIVA",
      },
    });
  }
}

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

  const profesor = await prisma.usuario.upsert({
    where: {
      email: "profesor@sportify.com",
    },
    update: {
      password: "Profesor123!",
      rol: "PROFESOR",
      activo: true,
    },
    create: {
      dni: 11111111,
      nombre: "Carlos",
      apellido: "Gómez",
      email: "profesor@sportify.com",
      password: "Profesor123!",
      fechaNac: new Date("1990-05-10"),
      aptoFisico: null,
      rol: "PROFESOR",
      activo: true,
    },
  });

  const profesor2 = await prisma.usuario.upsert({
  where: {
    email: "maria@sportify.com",
  },
  update: {
    password: "Profesor123!",
    rol: "PROFESOR",
    activo: true,
  },
  create: {
    dni: 33333333,
    nombre: "María",
    apellido: "Pérez",
    email: "maria@sportify.com",
    password: "Profesor123!",
    fechaNac: new Date("1992-08-20"),
    aptoFisico: null,
    rol: "PROFESOR",
    activo: true,
  },
});

  const cliente = await prisma.usuario.upsert({
    where: {
      email: "cliente@sportify.com",
    },
    update: {
      password: "Cliente123!",
      rol: "CLIENTE",
      activo: true,
    },
    create: {
      dni: 22222222,
      nombre: "Lucía",
      apellido: "Fernández",
      email: "cliente@sportify.com",
      password: "Cliente123!",
      fechaNac: new Date("2002-03-15"),
      aptoFisico: null,
      rol: "CLIENTE",
      activo: true,
    },
  });

  const ocupante1 = await crearClienteOcupanteSiNoExiste({
    dni: 33333333,
    nombre: "Martina",
    apellido: "Pérez",
    email: "ocupante1@sportify.com",
  });

  const ocupante2 = await crearClienteOcupanteSiNoExiste({
    dni: 44444444,
    nombre: "Sofía",
    apellido: "López",
    email: "ocupante2@sportify.com",
  });

  const funcional = await prisma.disciplina.upsert({
    where: {
      nombre: "Funcional",
    },
    update: {
      activa: true,
    },
    create: {
      nombre: "Funcional",
      descripcion: "Entrenamiento funcional de intensidad media.",
      activa: true,
    },
  });

  const yoga = await prisma.disciplina.upsert({
    where: {
      nombre: "Yoga",
    },
    update: {
      activa: true,
    },
    create: {
      nombre: "Yoga",
      descripcion: "Clase de yoga inicial.",
      activa: true,
    },
  });

  const pilates = await prisma.disciplina.upsert({
    where: {
      nombre: "Pilates",
    },
    update: {
      activa: true,
    },
    create: {
      nombre: "Pilates",
      descripcion: "Clase de pilates.",
      activa: true,
    },
  });

  await crearClaseSiNoExiste({
    titulo: "Funcional - Turno Mañana",
    descripcion: "Clase de entrenamiento funcional.",
    fechaHora: new Date("2026-06-01T09:00:00"),
    duracionMin: 60,
    cupoMaximo: 10,
    precio: 4500,
    disciplinaId: funcional.id,
    profesorId: profesor.id,
  });

  await crearClaseSiNoExiste({
    titulo: "Funcional - Turno Mañana",
    descripcion: "Clase de entrenamiento funcional.",
    fechaHora: new Date("2026-06-08T09:00:00"),
    duracionMin: 60,
    cupoMaximo: 10,
    precio: 4500,
    disciplinaId: funcional.id,
    profesorId: profesor.id,
  });

  const funcionalLunes15 = await crearClaseSiNoExiste({
    titulo: "Funcional - Turno Mañana",
    descripcion:
      "Clase de entrenamiento funcional. Clase llena para probar lista de espera.",
    fechaHora: new Date("2026-06-15T09:00:00"),
    duracionMin: 60,
    cupoMaximo: 2,
    precio: 4500,
    disciplinaId: funcional.id,
    profesorId: profesor.id,
  });

  await crearClaseSiNoExiste({
    titulo: "Funcional - Turno Mañana",
    descripcion: "Clase de entrenamiento funcional.",
    fechaHora: new Date("2026-06-22T09:00:00"),
    duracionMin: 60,
    cupoMaximo: 10,
    precio: 4500,
    disciplinaId: funcional.id,
    profesorId: profesor.id,
  });

  await crearClaseSiNoExiste({
    titulo: "Funcional - Turno Mañana",
    descripcion: "Clase de entrenamiento funcional.",
    fechaHora: new Date("2026-06-29T09:00:00"),
    duracionMin: 60,
    cupoMaximo: 10,
    precio: 4500,
    disciplinaId: funcional.id,
    profesorId: profesor.id,
  });

  await ocuparClaseCompleta({
    claseId: funcionalLunes15.id,
    usuariosIds: [ocupante1.id, ocupante2.id],
  });

  await crearClaseSiNoExiste({
    titulo: "Yoga Inicial",
    descripcion: "Clase de yoga para principiantes.",
    fechaHora: new Date("2026-06-01T18:00:00"),
    duracionMin: 60,
    cupoMaximo: 8,
    precio: 4000,
    disciplinaId: yoga.id,
    profesorId: profesor.id,
  });

  await crearClaseSiNoExiste({
    titulo: "Pilates intermedio",
    descripcion: "Clase de pilates para todas las edades.",
    fechaHora: new Date("2026-06-02T19:00:00"),
    duracionMin: 45,
    cupoMaximo: 12,
    precio: 5000,
    disciplinaId: pilates.id,
    profesorId: profesor.id,
  });

  console.log("Seed ejecutado correctamente.");

  console.log("Admin:");
  console.log({
    id: admin.id,
    email: admin.email,
    password: adminPassword,
    rol: admin.rol,
  });

  console.log("Profesor:");
  console.log({
    id: profesor.id,
    email: profesor.email,
    password: "Profesor123!",
    rol: profesor.rol,
  });

  console.log("Cliente para probar abono:");
  console.log({
    id: cliente.id,
    email: cliente.email,
    password: "Cliente123!",
    rol: cliente.rol,
  });

  console.log("Clase llena para probar lista de espera:");
  console.log({
    id: funcionalLunes15.id,
    titulo: funcionalLunes15.titulo,
    fechaHora: funcionalLunes15.fechaHora,
    cupoMaximo: funcionalLunes15.cupoMaximo,
    ocupantes: [ocupante1.email, ocupante2.email],
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