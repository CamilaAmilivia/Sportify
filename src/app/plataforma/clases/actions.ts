"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requerirRol } from "@/lib/sesion";

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
      fechaHora: true,
      duracionMin: true,
      serieId: true,
      disciplinaId: true,
      profesorId: true,
    },
  });

  if (!claseBase) {
    return { error: "La clase seleccionada ya no existe." };
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const finAnio = new Date(2026, 11, 31, 23, 59, 59, 999);

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
    return { error: "No se encontraron clases para eliminar desde hoy hasta fin de anio." };
  }

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

  if (clase.estado === "CANCELADA") {
    return { error: "La clase ya se encuentra suspendida." };
  }

  await prisma.clase.update({
    where: { id: claseId },
    data: { estado: "CANCELADA" }
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

  for (const inscripcion of clase.inscripciones) {
    await prisma.inscripcion.update({
      where: { id: inscripcion.id },
      data: { estado: "CANCELADA" }
    });

    const esAbonado = inscripcion.pago?.tipo === "MENSUALIDAD";
    let mensaje = "";

    if (esAbonado) {
      await otorgarCreditoClase({
        usuarioId: inscripcion.usuarioId,
        claseOrigenId: clase.id,
        motivo: `Reintegro por clase "${clase.titulo}" suspendida el ${fechaClaseStr}.`
      });
      mensaje = `La clase de ${clase.disciplina.nombre} del ${fechaClaseStr} a las ${horarioInicioStr} ha sido suspendida. Se te ha otorgado un crédito de clase gratis.`;
    } else {
      mensaje = `La clase de ${clase.disciplina.nombre} del ${fechaClaseStr} a las ${horarioInicioStr} ha sido suspendida. Recibirás tu reintegro en efectivo en el gimnasio.`;
    }

    await crearNotificacion(inscripcion.usuarioId, mensaje);
  }

  const mensajeProfesor = `La clase de ${clase.disciplina.nombre} del ${fechaClaseStr} a las ${horarioInicioStr} que tenías asignada ha sido suspendida.`;
  await crearNotificacion(clase.profesorId, mensajeProfesor);

  revalidatePath("/plataforma/clases");
  revalidatePath("/plataforma/cronograma");
  revalidatePath("/plataforma/mis-clases");

  return { success: true };
}

export async function editarClase(
  claseId: number,
  formData: {
    titulo: string;
    profesorId: number;
    fechaHora: string;
    disciplinaId: number;
    cupoMaximo: number;
    precio: number;
  }
) {
  await requerirRol(["ADMIN"]);

  try {
    const errores: any = {};

    if (!formData.titulo) errores.titulo = ["El título de la clase es requerido"];
    if (!formData.profesorId || isNaN(formData.profesorId)) errores.profesorId = ["Debes seleccionar un profesor"];
    if (!formData.fechaHora) errores.fechaHora = ["La fecha y hora es requerida"];
    if (!formData.cupoMaximo || formData.cupoMaximo <= 0) {
      errores.cupoMaximo = ["El cupo máximo debe ser mayor a 0"];
    }
    if (formData.precio !== undefined && formData.precio <= 0) {
      errores.precio = ["El precio debe ser mayor a 0"];
    }
    if (!formData.disciplinaId || isNaN(formData.disciplinaId)) {
      errores.disciplinaId = ["Debes seleccionar una disciplina"];
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

    let disciplinaActual = null;
    if (!errores.disciplinaId) {
      disciplinaActual = await prisma.disciplina.findUnique({
        where: { id: formData.disciplinaId },
      });

      if (!disciplinaActual) {
        errores.disciplinaId = ["La disciplina seleccionada no existe"];
      }
    }

    if (Object.keys(errores).length > 0 || !profesorEncontrado || !disciplinaActual) {
      return { errores };
    }

    const fechaNueva = new Date(formData.fechaHora);
    const duracionMin = claseActual.duracionMin;

    const obtenerClasesSuperpuestasEdicion = async (inicioClase: Date) => {
      const finClase = new Date(inicioClase.getTime() + duracionMin * 60000);
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
        include: {
          disciplina: true,
        },
      });

      return clasesDelDia.filter((clase) => {
        const inicioExistente = new Date(clase.fechaHora);
        const finExistente = new Date(clase.fechaHora);
        finExistente.setMinutes(finExistente.getMinutes() + clase.duracionMin);

        return inicioClase < finExistente && finClase > inicioExistente;
      });
    };

    const calcularCuposOcupadosEdicion = (
      clases: any[],
      inicioClase: Date
    ) => {
      const finClase = new Date(inicioClase.getTime() + duracionMin * 60000);
      const puntosDeControl = [
        inicioClase,
        ...clases.flatMap((clase) => {
          const inicioExistente = new Date(clase.fechaHora);
          const finExistente = new Date(clase.fechaHora);
          finExistente.setMinutes(finExistente.getMinutes() + clase.duracionMin);
          return [inicioExistente, finExistente];
        }),
      ].filter((punto) => punto >= inicioClase && punto < finClase);

      return puntosDeControl.reduce((maximo, punto) => {
        const cuposEnPunto = clases.reduce((total, clase) => {
          const inicioExistente = new Date(clase.fechaHora);
          const finExistente = new Date(clase.fechaHora);
          finExistente.setMinutes(finExistente.getMinutes() + clase.duracionMin);

          if (inicioExistente <= punto && finExistente > punto) {
            return total + clase.cupoMaximo;
          }

          return total;
        }, 0);

        return Math.max(maximo, cuposEnPunto);
      }, 0);
    };

    const clasesSuperpuestas = await obtenerClasesSuperpuestasEdicion(fechaNueva);
    const claseDelProfesorEnHorario = clasesSuperpuestas.find(
      (clase) => clase.profesorId === formData.profesorId
    );

    if (claseDelProfesorEnHorario) {
      errores.profesorId = [
        `${profesorEncontrado.nombre} ya tiene una clase asignada el ${fechaNueva.getDate().toString().padStart(2, '0')}/${(fechaNueva.getMonth()+1).toString().padStart(2, '0')}/${fechaNueva.getFullYear()} a las ${fechaNueva.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false })}`,
      ];
    }

    const yaExisteDisciplina = clasesSuperpuestas.find(
      (clase) => clase.disciplinaId === formData.disciplinaId
    );

    if (yaExisteDisciplina) {
      errores.disciplinaId = [
        `Ya existe una clase de esta disciplina en el mismo horario.`,
      ];
    }

    const disciplinasEnHorario = new Set(
      clasesSuperpuestas.map((c) => c.disciplina.nombre)
    );

    if (disciplinasEnHorario.size >= 3 && !disciplinasEnHorario.has(disciplinaActual.nombre)) {
      errores.disciplinaId = [
        `No se pueden agregar más de 3 disciplinas diferentes en el mismo horario. Actualmente hay: ${Array.from(disciplinasEnHorario).join(", ")}`,
      ];
    }

    const cuposActuales = calcularCuposOcupadosEdicion(clasesSuperpuestas, fechaNueva);
    const cuposTotales = cuposActuales + formData.cupoMaximo;

    if (cuposTotales > 30) {
      errores.cupoMaximo = [
        `La suma de cupos no puede exceder 30. Actual: ${cuposActuales}. Tu clase: ${formData.cupoMaximo}.`,
      ];
    }

    if (Object.keys(errores).length > 0) {
      return { errores };
    }

    await prisma.clase.update({
      where: { id: claseId },
      data: {
        titulo: formData.titulo,
        disciplinaId: formData.disciplinaId,
        profesorId: formData.profesorId,
        fechaHora: fechaNueva,
        cupoMaximo: formData.cupoMaximo,
        precio: formData.precio,
      },
    });

    revalidatePath("/plataforma/clases");
    revalidatePath("/plataforma/cronograma");
    revalidatePath("/plataforma/mis-clases");

    return { success: true };
  } catch (error) {
    console.error("Error al editar clase:", error);
    return { error: "Error al editar la clase. Intenta nuevamente." };
  }
}
