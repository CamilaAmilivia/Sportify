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
    dni: 55555555,
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

// ==========================================
// CLASE DEMO
// ==========================================

await crearClaseSiNoExiste({
  titulo: "Funcional",
  descripcion: "Clase demo para presentación.",
  fechaHora: new Date("2026-07-01T10:00:00"),
  duracionMin: 60,
  cupoMaximo: 10,
  precio: 1000,
  disciplinaId: funcional.id,
  profesorId: profesor.id,
});

// ==========================================
// CLASE PARA PROBAR INSCRIPCIÓN / PAGO
// ==========================================

await crearClaseSiNoExiste({
  titulo: "Funcional Test Pago",
  descripcion: "Clase para probar inscripción y pago.",
  fechaHora: new Date("2026-07-03T10:00:00"),
  duracionMin: 60,
  cupoMaximo: 10,
  precio: 2000,
  disciplinaId: funcional.id,
  profesorId: profesor.id,
});

// ==========================================
// CLASE LLENA PARA LISTA DE ESPERA
// ==========================================

const claseListaEspera = await crearClaseSiNoExiste({
  titulo: "Funcional Test Lista Espera",
  descripcion: "Clase llena para probar lista de espera.",
  fechaHora: new Date("2026-07-04T10:00:00"),
  duracionMin: 60,
  cupoMaximo: 2,
  precio: 2000,
  disciplinaId: funcional.id,
  profesorId: profesor.id,
});

await ocuparClaseCompleta({
  claseId: claseListaEspera.id,
  usuariosIds: [ocupante1.id, ocupante2.id],
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



}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
