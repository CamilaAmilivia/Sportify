import { PrismaClient } from "../../src/generated/prisma/client";

export async function createClasesQR(
  prisma: PrismaClient,
  profesorId: number,
  profesor2Id: number,
  disciplinaId: number,
  clientesIds: number[]
) {
  console.log("📅 Creando clases para test de QR...");
  const ahora = new Date();

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
      disciplinaId: disciplinaId,
      profesorId: profesorId,
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
      disciplinaId: disciplinaId,
      profesorId: profesorId,
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
      disciplinaId: disciplinaId,
      profesorId: profesorId,
    }
  });

  // 4. Clase Ahora QR con Profesor 2
  const claseAhoraProf2 = await prisma.clase.create({
    data: {
      titulo: "Clase Ahora QR (Profesor 2)",
      descripcion: "Posible tomar asistencia - Prof 2",
      fechaHora: horaAhora,
      duracionMin: 60,
      cupoMaximo: 10,
      precio: 0,
      estado: "ACTIVA",
      disciplinaId: disciplinaId,
      profesorId: profesor2Id,
    }
  });

  const clases = [claseTarde, claseAhora, claseTemprano, claseAhoraProf2];

  const clasesProfe1 = [claseTarde, claseAhora, claseTemprano];

  // Inscribir a los clientes en las tres clases del Profesor 1
  for (const clase of clasesProfe1) {
    for (const clienteId of clientesIds) {
      await prisma.inscripcion.create({
        data: {
          usuarioId: clienteId,
          claseId: clase.id,
          estado: "ACTIVA"
        }
      });
    }
  }

  // Inscribir solo a Cliente 2 en la clase de Profesor 2
  const cliente2 = await prisma.usuario.findUnique({
    where: { email: "cliente2@joaquin.caraballo.com.ar" }
  });
  const cliente2Id = cliente2?.id ?? clientesIds[1];

  if (cliente2Id) {
    await prisma.inscripcion.create({
      data: {
        usuarioId: cliente2Id,
        claseId: claseAhoraProf2.id,
        estado: "ACTIVA"
      }
    });
  }

  console.log(`✅ Creada clase "Clase Tarde QR" (-2 hrs, ID: ${claseTarde.id})`);
  console.log(`✅ Creada clase "Clase Ahora QR" (AHORA, ID: ${claseAhora.id})`);
  console.log(`✅ Creada clase "Clase Temprano QR" (+2 hrs, ID: ${claseTemprano.id})`);
  console.log(`✅ Inscriptos ${clientesIds.length} clientes en estas 3 clases.`);
}
