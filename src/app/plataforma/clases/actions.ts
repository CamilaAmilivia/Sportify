"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirRol } from "@/lib/sesion";
import { sendClaseCanceladaEmail} from "@/lib/mail";
import { TipoPago, Usuario } from "@/generated/prisma/client";

export async function obtenerClasesFiltradas(fechaInicioIso: string, fechaFinIso: string) {
  await requerirRol(["ADMIN"]);
  
  const clases = await prisma.clase.findMany({
    where: {
      fechaHora: {
        gte: new Date(fechaInicioIso),
        lte: new Date(fechaFinIso),
      }
    },
    include: {
      disciplina: { select: { nombre: true } },
      profesor: { select: { nombre: true, apellido: true } },
    },
    orderBy: { fechaHora: "asc" },
  });
  
  return clases;
}



export async function eliminarClasesSimilares(claseId: number) {
  await requerirRol(["ADMIN"]);

  if (!Number.isInteger(claseId) || claseId <= 0) {
    return { error: "La clase seleccionada no es valida." };
  }

  const claseBase = await prisma.clase.findUnique({
  where: { id: claseId },
  select: {
    id: true,
    titulo: true,
    fechaHora: true,
    duracionMin: true,
    serieId: true,
    disciplinaId: true,
    profesorId: true,
    profesor: {
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
      },
    },
  },
});

  if (!claseBase) {
    return { error: "La clase seleccionada ya no existe." };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (claseBase.fechaHora < hoy) {
  return {
    error: "No es posible eliminar clases con fecha anterior al día de hoy.",
  };
}

  const finAnio = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);

  const baseDiaSemana = claseBase.fechaHora.getDay();
  const baseHora = claseBase.fechaHora.getHours();
  const baseMinutos = claseBase.fechaHora.getMinutes();

  const candidatas = await prisma.clase.findMany({
    where: {
      fechaHora: {
        gte: hoy,
        lte: finAnio,
      },
      disciplinaId: claseBase.disciplinaId,
      profesorId: claseBase.profesorId,
      duracionMin: claseBase.duracionMin,
      ...(claseBase.serieId ? { serieId: claseBase.serieId } : {}),
    },
    select: {
      id: true,
      fechaHora: true,
    },
  });

  const clasesAEliminar = candidatas.filter((clase) => {
    if (claseBase.serieId) return true;

    return (
      clase.fechaHora.getDay() === baseDiaSemana &&
      clase.fechaHora.getHours() === baseHora &&
      clase.fechaHora.getMinutes() === baseMinutos
    );
  });

  const ids = clasesAEliminar.map((clase) => clase.id);

  if (ids.length === 0) {
    return { error: "No se encontraron clases para eliminar desde hoy hasta fin de año." };
  }

  const clasesConDatos = await prisma.clase.findMany({
  where: {
    id: { in: ids },
  },
  include: {
    profesor: true,
    inscripciones: {
      include: {
        usuario: true,
        pago: true,
      },
    },
  },
});

const { crearNotificacion } = await import("@/lib/notificaciones");

// Notificar a cada inscripto y otorgar crédito por cada clase cancelada
const emailsNotificados = new Set<number>();

for (const clase of clasesConDatos) {
  const fechaStr = clase.fechaHora.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" });

  for (const inscripcion of clase.inscripciones) {
    const esAbonado = inscripcion.pago?.tipo === TipoPago.MENSUALIDAD;

    // Crédito por cada clase cancelada (abonados)
    if (esAbonado) {
      await prisma.creditoClase.create({
        data: {
          usuarioId: inscripcion.usuario.id,
          motivo: `Cancelación de clase "${claseBase.titulo}" del ${fechaStr}.`,
          claseOrigenId: clase.id,
          usado: false,
        },
      });
    }

    // Bell notification por cada usuario (solo una vez total)
    if (!emailsNotificados.has(inscripcion.usuario.id)) {
      const mensaje = esAbonado
        ? `La serie de clases "${claseBase.titulo}" fue cancelada. Recibirás un crédito por cada clase cancelada.`
        : `La serie de clases "${claseBase.titulo}" fue cancelada. Recibirás tu reintegro en efectivo en el gimnasio.`;
      await crearNotificacion(inscripcion.usuario.id, mensaje);
      emailsNotificados.add(inscripcion.usuario.id);
    }
  }

  // Notificar a usuarios en lista de espera de esta clase
  const enEspera = await prisma.listaEspera.findMany({
    where: { claseId: clase.id },
    include: { usuario: true },
  });
  for (const entrada of enEspera) {
    if (!emailsNotificados.has(entrada.usuarioId)) {
      await crearNotificacion(
        entrada.usuarioId,
        `La clase "${claseBase.titulo}" del ${fechaStr} en la que estabas en lista de espera fue cancelada.`
      );
      emailsNotificados.add(entrada.usuarioId);
    }
  }
}

// Email a cada cliente único (una vez por usuario)
const usuariosEmail = new Map<number, { usuario: Usuario; esAbonado: boolean }>();
for (const clase of clasesConDatos) {
  for (const inscripcion of clase.inscripciones) {
    if (!usuariosEmail.has(inscripcion.usuario.id)) {
      usuariosEmail.set(inscripcion.usuario.id, {
        usuario: inscripcion.usuario,
        esAbonado: inscripcion.pago?.tipo === TipoPago.MENSUALIDAD,
      });
    }
  }
}
for (const clase of clasesConDatos) {
  for (const inscripcion of clase.inscripciones) {
    const esAbonado = inscripcion.pago?.tipo === TipoPago.MENSUALIDAD;
    if (!usuariosEmail.has(inscripcion.usuario.id)) continue;
    await sendClaseCanceladaEmail(
      inscripcion.usuario.email,
      inscripcion.usuario.nombre,
      claseBase.titulo,
      claseBase.fechaHora,
      esAbonado,
      esAbonado ? undefined : inscripcion.pago?.monto
    );
    usuariosEmail.delete(inscripcion.usuario.id);
  }
}

// Notificar al profesor una única vez
await crearNotificacion(claseBase.profesorId, `La serie de clases "${claseBase.titulo}" fue cancelada.`);
await sendClaseCanceladaEmail(
  claseBase.profesor.email,
  claseBase.profesor.nombre,
  claseBase.titulo,
  claseBase.fechaHora,
  false
);

  await prisma.$transaction([
    prisma.asistencia.deleteMany({ where: { claseId: { in: ids } } }),
    prisma.listaEspera.deleteMany({ where: { claseId: { in: ids } } }),
    prisma.inscripcion.deleteMany({ where: { claseId: { in: ids } } }),
    prisma.pago.updateMany({
      where: { claseId: { in: ids } },
      data: { claseId: null },
    }),
    prisma.clase.deleteMany({ where: { id: { in: ids } } }),
  ]);

  revalidatePath("/plataforma/clases");
  revalidatePath("/plataforma/cronograma");
  revalidatePath("/plataforma/mis-clases");

  return { success: true, cantidadEliminadas: ids.length };
}

export async function suspenderClase(claseId: number) {
  await requerirRol(["ADMIN"]);

  if (!Number.isInteger(claseId) || claseId <= 0) {
    return { error: "La clase seleccionada no es válida." };
  }

  const clase = await prisma.clase.findUnique({
    where: { id: claseId },
    include: {
      disciplina: true,
      profesor: true,
      inscripciones: {
        where: { estado: "ACTIVA" },
        include: {
          usuario: true,
          pago: true,
        }
      }
    }
  });

  if (!clase) {
    return { error: "La clase seleccionada no existe." };
  }

  if (clase.estado === "SUSPENDIDA") {
    return { error: "La clase ya se encuentra suspendida." };
  }

  if (clase.estado === "CANCELADA") {
    return { error: "La clase ya está cancelada." };
  }

  await prisma.clase.update({
    where: { id: claseId },
    data: { estado: "SUSPENDIDA" }
  });

  const fechaClaseStr = new Date(clase.fechaHora).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
  
  const horarioInicioStr = new Date(clase.fechaHora).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });

  const { crearNotificacion } = await import("@/lib/notificaciones");
  const { otorgarCreditoClase } = await import("@/lib/creditos");
  const { sendClaseSuspendidaEmail } = await import("@/lib/mail");

  for (const inscripcion of clase.inscripciones) {
    await prisma.inscripcion.update({
      where: { id: inscripcion.id },
      data: { estado: "CANCELADA" }
    });

    const esAbonado = inscripcion.pago?.tipo === "MENSUALIDAD";
    let mensaje = "";

    if (esAbonado) {
      // El crédito se otorga específicamente para esta clase suspendida
      // y no afecta ninguna otra inscripción del cliente
      await otorgarCreditoClase({
        usuarioId: inscripcion.usuarioId,
        claseOrigenId: clase.id,
        motivo: `Reintegro por clase "${clase.titulo}" suspendida el ${fechaClaseStr}.`
      });
      mensaje = `La clase de ${clase.disciplina.nombre} del ${fechaClaseStr} a las ${horarioInicioStr} ha sido suspendida. Se te ha otorgado un crédito de clase gratis que puedes usar en cualquier otra clase.`;
    } else {
      mensaje = `La clase de ${clase.disciplina.nombre} del ${fechaClaseStr} a las ${horarioInicioStr} ha sido suspendida. Recibirás tu reintegro en efectivo en el gimnasio.`;
    }

    await crearNotificacion(inscripcion.usuarioId, mensaje);

    // Enviar mail al cliente (solo si SMTP está disponible)
    try {
      await sendClaseSuspendidaEmail(
        inscripcion.usuario.email,
        inscripcion.usuario.nombre,
        clase.titulo,
        clase.disciplina.nombre,
        clase.fechaHora,
        esAbonado,
        esAbonado ? undefined : inscripcion.pago?.monto
      );
    } catch (error) {
      console.error(`No se pudo enviar mail a ${inscripcion.usuario.email}:`, error);
      // Continuar con otros clientes incluso si falla un mail
    }
  }

  const mensajeProfesor = `La clase de ${clase.disciplina.nombre} del ${fechaClaseStr} a las ${horarioInicioStr} que tenías asignada ha sido suspendida.`;
  await crearNotificacion(clase.profesorId, mensajeProfesor);

  // Enviar mail al profesor (solo si SMTP está disponible)
  try {
    await sendClaseSuspendidaEmail(
      clase.profesor.email,
      clase.profesor.nombre,
      clase.titulo,
      clase.disciplina.nombre,
      clase.fechaHora,
      false
    );
  } catch (error) {
    console.error(`No se pudo enviar mail al profesor ${clase.profesor.email}:`, error);
    // La suspensión se completó correctamente, el mail es secundario
  }

  // Notificar y limpiar lista de espera
  const enEspera = await prisma.listaEspera.findMany({
    where: { claseId },
    include: { usuario: true },
  });

  for (const entrada of enEspera) {
    await crearNotificacion(
      entrada.usuarioId,
      `La clase "${clase.titulo}" del ${fechaClaseStr} a las ${horarioInicioStr} en la que estabas en lista de espera ha sido suspendida.`
    );
  }

  await prisma.listaEspera.deleteMany({ where: { claseId } });

  revalidatePath("/plataforma/clases");
  revalidatePath("/plataforma/cronograma");
  revalidatePath("/plataforma/mis-clases");

  return { success: true };
}

export async function obtenerLimitesCupoClase(claseId: number) {
  await requerirRol(["ADMIN"]);

  if (!Number.isInteger(claseId) || claseId <= 0) {
    throw new Error("ID de clase inválido.");
  }

  const clase = await prisma.clase.findUnique({
    where: { id: claseId },
    select: {
      id: true,
      fechaHora: true,
      duracionMin: true,
    },
  });

  if (!clase) {
    throw new Error("La clase seleccionada no existe.");
  }

  const inscriptosActuales = await prisma.inscripcion.count({
    where: {
      claseId,
      estado: "ACTIVA",
    },
  });

  const inicioClase = new Date(clase.fechaHora);
  const finClase = new Date(inicioClase.getTime() + clase.duracionMin * 60000);
  const inicioDia = new Date(inicioClase);
  inicioDia.setHours(0, 0, 0, 0);
  const finDia = new Date(inicioClase);
  finDia.setHours(23, 59, 59, 999);

  const clasesDelDia = await prisma.clase.findMany({
    where: {
      id: { not: claseId },
      estado: "ACTIVA",
      fechaHora: {
        gte: inicioDia,
        lte: finDia,
      },
    },
    select: {
      id: true,
      fechaHora: true,
      duracionMin: true,
      cupoMaximo: true,
    },
  });

  const clasesSuperpuestas = clasesDelDia.filter((c) => {
    const inicioExistente = new Date(c.fechaHora);
    const finExistente = new Date(c.fechaHora);
    finExistente.setMinutes(finExistente.getMinutes() + c.duracionMin);
    return inicioClase < finExistente && finClase > inicioExistente;
  });

  const puntosDeControl = [
    inicioClase,
    ...clasesSuperpuestas.flatMap((c) => {
      const inicioExistente = new Date(c.fechaHora);
      const finExistente = new Date(c.fechaHora);
      finExistente.setMinutes(finExistente.getMinutes() + c.duracionMin);
      return [inicioExistente, finExistente];
    }),
  ].filter((punto) => punto >= inicioClase && punto < finClase);

  const cuposOtros = puntosDeControl.reduce((maximo, punto) => {
    const cuposEnPunto = clasesSuperpuestas.reduce((total, c) => {
      const inicioExistente = new Date(c.fechaHora);
      const finExistente = new Date(c.fechaHora);
      finExistente.setMinutes(finExistente.getMinutes() + c.duracionMin);

      if (inicioExistente <= punto && finExistente > punto) {
        return total + c.cupoMaximo;
      }

      return total;
    }, 0);

    return Math.max(maximo, cuposEnPunto);
  }, 0);

  const maximoPermitido = Math.max(inscriptosActuales, 30 - cuposOtros);

  return {
    inscriptosActuales,
    maximoPermitido,
  };
}

export async function editarClase(
  claseId: number,
  formData: {
    titulo: string;
    profesorId: number;
    cupoMaximo: number;
  },
  aplicarAFuturas: boolean = false
) {
  await requerirRol(["ADMIN"]);

  try {
    const errores: any = {};

    if (!formData.titulo) errores.titulo = ["El título de la clase es requerido"];
    if (!formData.profesorId || isNaN(formData.profesorId)) errores.profesorId = ["Debes seleccionar un profesor"];
    if (!formData.cupoMaximo || formData.cupoMaximo <= 0) {
      errores.cupoMaximo = ["El cupo máximo debe ser mayor a 0"];
    }

    const claseActual = await prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!claseActual) {
      return { error: "La clase a editar no existe." };
    }

    let profesorEncontrado = null;
    if (!errores.profesorId) {
      profesorEncontrado = await prisma.usuario.findUnique({
        where: { id: formData.profesorId },
      });

      if (!profesorEncontrado) {
        errores.profesorId = [`Profesor no encontrado`];
      } else if (profesorEncontrado.rol !== "PROFESOR") {
        errores.profesorId = ["El usuario seleccionado no es un profesor"];
      }
    }

    if (Object.keys(errores).length > 0 || !profesorEncontrado) {
      return { errores };
    }

    // SI APLICAR A FUTURAS ES TRUE
    if (aplicarAFuturas && claseActual.serieId) {
      const clasesFuturas = await prisma.clase.findMany({
        where: {
          serieId: claseActual.serieId,
          fechaHora: { gte: claseActual.fechaHora },
          estado: "ACTIVA",
        },
      });

      for (const c of clasesFuturas) {
        const fechaClase = new Date(c.fechaHora);
        const fechaClaseStr = `${fechaClase.getDate().toString().padStart(2, '0')}/${(fechaClase.getMonth() + 1).toString().padStart(2, '0')}/${fechaClase.getFullYear()}`;

        // 1. Validar profesor ocupado
        const inicioDia = new Date(fechaClase);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(fechaClase);
        finDia.setHours(23, 59, 59, 999);

        const clasesProfesor = await prisma.clase.findMany({
          where: {
            id: { not: c.id },
            profesorId: formData.profesorId,
            estado: "ACTIVA",
            fechaHora: {
              gte: inicioDia,
              lte: finDia,
            },
          },
        });

        const nuevaInicio = new Date(fechaClase);
        const nuevaFin = new Date(fechaClase.getTime() + c.duracionMin * 60000);

        const profesorOcupado = clasesProfesor.some((other) => {
          const existenteInicio = new Date(other.fechaHora);
          const existenteFin = new Date(other.fechaHora);
          existenteFin.setMinutes(existenteFin.getMinutes() + other.duracionMin);

          return nuevaInicio < existenteFin && nuevaFin > existenteInicio;
        });

        if (profesorOcupado) {
          return {
            error: `El profesor ${profesorEncontrado.nombre} ${profesorEncontrado.apellido} ya tiene una clase asignada el ${fechaClaseStr} a las ${fechaClase.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}. No se pudo modificar la serie.`,
          };
        }

        // 2. Validar cupo mínimo (inscriptos en esa fecha)
        const inscriptosEnFecha = await prisma.inscripcion.count({
          where: {
            claseId: c.id,
            estado: "ACTIVA",
          },
        });

        if (formData.cupoMaximo < inscriptosEnFecha) {
          return {
            error: `La clase del día ${fechaClaseStr} ya tiene ${inscriptosEnFecha} alumnos inscritos. No puedes reducir el cupo de la serie a ${formData.cupoMaximo} debido a esta clase.`,
          };
        }

        // 3. Validar cupo máximo (suma de cupos <= 30)
        const clasesDelDia = await prisma.clase.findMany({
          where: {
            id: { not: c.id },
            estado: "ACTIVA",
            fechaHora: {
              gte: inicioDia,
              lte: finDia,
            },
          },
        });

        const clasesSuperpuestas = clasesDelDia.filter((other) => {
          const inicioExistente = new Date(other.fechaHora);
          const finExistente = new Date(other.fechaHora);
          finExistente.setMinutes(finExistente.getMinutes() + other.duracionMin);
          return nuevaInicio < finExistente && nuevaFin > inicioExistente;
        });

        const puntosDeControl = [
          nuevaInicio,
          ...clasesSuperpuestas.flatMap((other) => {
            const inicioExistente = new Date(other.fechaHora);
            const finExistente = new Date(other.fechaHora);
            finExistente.setMinutes(finExistente.getMinutes() + other.duracionMin);
            return [inicioExistente, finExistente];
          }),
        ].filter((punto) => punto >= nuevaInicio && punto < nuevaFin);

        const cuposOtros = puntosDeControl.reduce((maximo, punto) => {
          const cuposEnPunto = clasesSuperpuestas.reduce((total, other) => {
            const inicioExistente = new Date(other.fechaHora);
            const finExistente = new Date(other.fechaHora);
            finExistente.setMinutes(finExistente.getMinutes() + other.duracionMin);

            if (inicioExistente <= punto && finExistente > punto) {
              return total + other.cupoMaximo;
            }

            return total;
          }, 0);

          return Math.max(maximo, cuposEnPunto);
        }, 0);

        if (formData.cupoMaximo + cuposOtros > 30) {
          return {
            error: `La clase del día ${fechaClaseStr} no se puede actualizar. Excede los 30 cupos totales por hora permitidos (clases paralelas ocupan ${cuposOtros} cupos en esa fecha).`,
          };
        }
      }

      // Si todo está ok, guardar en transacción
      await prisma.$transaction(
        clasesFuturas.map((c) =>
          prisma.clase.update({
            where: { id: c.id },
            data: {
              titulo: formData.titulo,
              profesorId: formData.profesorId,
              cupoMaximo: formData.cupoMaximo,
            },
          })
        )
      );
    } else {
      // EDICIÓN INDIVIDUAL (COMPORTAMIENTO ANTERIOR)
      const { inscriptosActuales, maximoPermitido } = await obtenerLimitesCupoClase(claseId);

      if (formData.cupoMaximo < inscriptosActuales) {
        errores.cupoMaximo = [`El cupo no puede ser menor a la cantidad de inscriptos actuales (${inscriptosActuales}).`];
      }

      if (formData.cupoMaximo > maximoPermitido) {
        errores.cupoMaximo = [`El cupo no puede superar el límite disponible (${maximoPermitido}) para evitar exceder 30 cupos en total.`];
      }

      const fechaClase = new Date(claseActual.fechaHora);
      const duracionMin = claseActual.duracionMin;
      const inicioDia = new Date(fechaClase);
      inicioDia.setHours(0, 0, 0, 0);
      const finDia = new Date(fechaClase);
      finDia.setHours(23, 59, 59, 999);

      const clasesProfesor = await prisma.clase.findMany({
        where: {
          id: { not: claseId },
          profesorId: formData.profesorId,
          estado: "ACTIVA",
          fechaHora: {
            gte: inicioDia,
            lte: finDia,
          },
        },
      });

      const nuevaInicio = new Date(fechaClase);
      const nuevaFin = new Date(fechaClase.getTime() + duracionMin * 60000);

      const profesorOcupado = clasesProfesor.some((clase) => {
        const existenteInicio = new Date(clase.fechaHora);
        const existenteFin = new Date(clase.fechaHora);
        existenteFin.setMinutes(existenteFin.getMinutes() + clase.duracionMin);

        return nuevaInicio < existenteFin && nuevaFin > existenteInicio;
      });

      if (profesorOcupado) {
        errores.profesorId = [
          `${profesorEncontrado.nombre} ya tiene una clase asignada el ${fechaClase.getDate().toString().padStart(2, '0')}/${(fechaClase.getMonth() + 1).toString().padStart(2, '0')}/${fechaClase.getFullYear()} a las ${fechaClase.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
        ];
      }

      if (Object.keys(errores).length > 0) {
        return { errores };
      }

      await prisma.clase.update({
        where: { id: claseId },
        data: {
          titulo: formData.titulo,
          profesorId: formData.profesorId,
          cupoMaximo: formData.cupoMaximo,
        },
      });
    }

    revalidatePath("/plataforma/clases");
    revalidatePath("/plataforma/cronograma");
    revalidatePath("/plataforma/mis-clases");

    return { success: true };
  } catch (error) {
    console.error("Error al editar clase:", error);
    return { error: "Error al editar la clase. Intenta nuevamente." };
  }
}
