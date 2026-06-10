"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function cerrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete("sportify_session");
  redirect("/login");
}

export type CrearClaseErrores = {
  titulo?: string[];
  profesorId?: string[];
  diaSemana?: string[];
  fechaInicio?: string[];
  fechaFin?: string[];
  horaInicio?: string[];
  horaFin?: string[];
  disciplinaId?: string[];
  cupoMaximo?: string[];
  precio?: string[];
  general?: string[];
};

export async function crearClase(formData: {
  titulo: string;
  profesorId: number;
  diaSemana: number;
  fechaInicio?: string;
  fechaFin?: string;
  horaInicio: string;
  horaFin: string;
  disciplinaId: number;
  cupoMaximo: number;
  precio?: number;
}) {
  try {
    const errores: CrearClaseErrores = {};

    // Validar datos básicos
    if (!formData.titulo) errores.titulo = ["El título de la clase es requerido"];
    if (!formData.profesorId || isNaN(formData.profesorId)) errores.profesorId = ["Debes seleccionar un profesor"];
    if (formData.diaSemana === undefined || formData.diaSemana < 0 || formData.diaSemana > 6) errores.diaSemana = ["El día de la semana es requerido"];
    if (!formData.horaInicio) errores.horaInicio = ["La hora de inicio es requerida"];
    if (!formData.horaFin) errores.horaFin = ["La hora de fin es requerida"];
    if (!formData.cupoMaximo || formData.cupoMaximo <= 0) {
      errores.cupoMaximo = ["El cupo máximo debe ser mayor a 0"];
    }
    if (formData.precio !== undefined && formData.precio <= 0) {
      errores.precio = ["El precio debe ser mayor a 0"];
    }

    if (!formData.disciplinaId || isNaN(formData.disciplinaId)) {
      errores.disciplinaId = ["Debes seleccionar una disciplina"];
    }

    // Validar profesor solo si hay un ID válido
    let profesorEncontrado = null;
    if (!errores.profesorId) {
      profesorEncontrado = await prisma.usuario.findUnique({
        where: { id: formData.profesorId },
      });

      if (!profesorEncontrado) {
        errores.profesorId = [`Profesor con ID "${formData.profesorId}" no encontrado en el sistema`];
      } else if (profesorEncontrado.rol !== "PROFESOR") {
        errores.profesorId = ["El usuario seleccionado no es un profesor"];
      }
    }

    // Validar disciplina solo si hay un ID válido
    let disciplinaActual = null;
    if (!errores.disciplinaId) {
      disciplinaActual = await prisma.disciplina.findUnique({
        where: { id: formData.disciplinaId },
      });

      if (!disciplinaActual) {
        errores.disciplinaId = ["La disciplina seleccionada no existe"];
      }
    }

    let fechaInicio: Date | null = null;
    let fechaLimite: Date | null = null;
    let duracionMin = 0;
    let horaInicioH = 0;
    let horaInicioM = 0;
    let horaFinH = 0;
    let horaFinM = 0;

    // Procesar fecha y hora
    if (!errores.diaSemana && !errores.horaInicio && !errores.horaFin) {
      [horaInicioH, horaInicioM] = formData.horaInicio.split(":").map(Number);
      [horaFinH, horaFinM] = formData.horaFin.split(":").map(Number);
      
      const inicioMin = horaInicioH * 60 + horaInicioM;
      const finMin = horaFinH * 60 + horaFinM;
      duracionMin = finMin - inicioMin;

      if (duracionMin <= 0) {
        errores.horaFin = ["La hora de fin debe ser posterior a la hora de inicio"];
      }

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (formData.fechaInicio) {
        // Asume formato "YYYY-MM-DD"
        const [y, m, d] = formData.fechaInicio.split("-").map(Number);
        fechaInicio = new Date(y, m - 1, d);
        fechaInicio.setHours(horaInicioH, horaInicioM, 0, 0);
      } else {
        fechaInicio = new Date(hoy);
        let diasParaProximo = formData.diaSemana - hoy.getDay();
        if (diasParaProximo <= 0) {
          diasParaProximo += 7;
        }
        fechaInicio.setDate(hoy.getDate() + diasParaProximo);
        fechaInicio.setHours(horaInicioH, horaInicioM, 0, 0);
      }

      if (formData.fechaFin) {
        const [y, m, d] = formData.fechaFin.split("-").map(Number);
        fechaLimite = new Date(y, m - 1, d);
        fechaLimite.setHours(23, 59, 59, 999);
      } else {
        fechaLimite = new Date(fechaInicio.getFullYear(), 11, 31, 23, 59, 59, 999); // 31 de dic
      }

      if (fechaInicio > fechaLimite) {
         errores.fechaFin = ["La fecha de fin no puede ser anterior al inicio"];
      }
    }

    if (Object.keys(errores).length > 0 || !fechaInicio || !fechaLimite || !profesorEncontrado || !disciplinaActual) {
      return { errores };
    }

    // ============= NUEVAS VALIDACIONES =============

    // Validación 0: Verificar que el profesor no tenga otra clase en el mismo horario
    const claseDelProfesorEnHorario = await prisma.clase.findFirst({
      where: {
        profesorId: formData.profesorId,
        fechaHora: fechaInicio,
        estado: "ACTIVA",
      },
    });

    if (claseDelProfesorEnHorario) {
      errores.profesorId = [
        `${profesorEncontrado.nombre} ya tiene una clase asignada el ${fechaInicio.getDate().toString().padStart(2, '0')}/${(fechaInicio.getMonth()+1).toString().padStart(2, '0')}/${fechaInicio.getFullYear()} en el horario ${formData.horaInicio} - ${formData.horaFin}`,
      ];
    }

    // Buscar clases existentes para el MISMO HORARIO (mismo inicio)
    const clasesEnMismoHorario = await prisma.clase.findMany({
      where: {
        fechaHora: fechaInicio,
        estado: "ACTIVA",
      },
      include: {
        disciplina: true,
      },
    });

    // Validación 1: No más de 3 disciplinas diferentes en el mismo horario
    const disciplinasEnHorario = new Set(
      clasesEnMismoHorario.map((c) => c.disciplina.nombre)
    );

    if (disciplinasEnHorario.size >= 3 && !disciplinasEnHorario.has(disciplinaActual.nombre)) {
      errores.disciplinaId = [
        `No se pueden agregar más de 3 disciplinas diferentes en el mismo horario. Actualmente hay: ${Array.from(disciplinasEnHorario).join(", ")}`,
      ];
    }

    // Validación 2: Suma total de cupos no puede exceder 30
    const cuposActuales = clasesEnMismoHorario.reduce(
      (sum, clase) => sum + clase.cupoMaximo,
      0
    );

    const cuposTotales = cuposActuales + formData.cupoMaximo;

    if (cuposTotales > 30) {
      errores.cupoMaximo = [
        `La suma de cupos no puede exceder 30. Actual: ${cuposActuales}. Tu clase: ${formData.cupoMaximo}.`,
      ];
    }

    if (Object.keys(errores).length > 0) {
      return { errores };
    }

    // ============= FIN DE NUEVAS VALIDACIONES =============

    // Validar para cada clase individualmente 
    const clasesCreadas = [];
    const erroresClases: string[] = [];

    const fechaActual = new Date(fechaInicio);

    const formatearFecha = (fecha: Date) =>
      fecha.toLocaleDateString("es-AR");

    const serieId = crypto.randomUUID();

    while (fechaActual <= fechaLimite) {

      const fechaFinActual = new Date(fechaActual);
      fechaFinActual.setHours(horaFinH, horaFinM, 0, 0);

      // ================= VALIDACIONES =================

      // Profesor ocupado
      const inicioDiaProfesor = new Date(fechaActual);
      inicioDiaProfesor.setHours(0, 0, 0, 0);

      const finDiaProfesor = new Date(fechaActual);
      finDiaProfesor.setHours(23, 59, 59, 999);

      const clasesProfesor = await prisma.clase.findMany({
        where: {
          profesorId: formData.profesorId,
          estado: "ACTIVA",
          fechaHora: {
            gte: inicioDiaProfesor,
            lte: finDiaProfesor,
          },
        },
      });

      const nuevaInicio = new Date(fechaActual);

      const nuevaFin = new Date(fechaActual);
      nuevaFin.setHours(horaFinH, horaFinM, 0, 0);

      const profesorOcupado = clasesProfesor.some((clase) => {
        const existenteInicio = new Date(clase.fechaHora);

        const existenteFin = new Date(clase.fechaHora);
        existenteFin.setMinutes(
          existenteFin.getMinutes() + clase.duracionMin
        );

        return (
          nuevaInicio < existenteFin &&
          nuevaFin > existenteInicio
        );
      });

      if (profesorOcupado) {
        erroresClases.push(
          `Clase del ${formatearFecha(fechaActual)} no creada: el profesor ya tiene una clase asignada`
        );

        fechaActual.setDate(fechaActual.getDate() + 7);
        continue;
      }

      // Clases en mismo horario
      const clasesEnHorario = await prisma.clase.findMany({
        where: {
          fechaHora: new Date(fechaActual),
          estado: "ACTIVA",
        },
        include: {
          disciplina: true,
        },
      });

      // Disciplina repetida
      const yaExisteDisciplina = await prisma.clase.findFirst({
        where: {
          disciplinaId: formData.disciplinaId,
          estado: "ACTIVA",
          fechaHora: new Date(fechaActual),
        },
      });

      if (yaExisteDisciplina) {
        erroresClases.push(
          `Clase del ${formatearFecha(fechaActual)} no creada: ya existe una clase de esta disciplina en el mismo horario`
        );

        fechaActual.setDate(fechaActual.getDate() + 7);
        continue;
      }

      // Cupos máximos
      const cuposActuales = clasesEnHorario.reduce(
        (sum, clase) => sum + clase.cupoMaximo,
        0
      );

      const totalCupos = cuposActuales + formData.cupoMaximo;

      if (totalCupos > 30) {
        erroresClases.push(
          `Clase del ${formatearFecha(fechaActual)} no creada: el total de cupos supera 30`
        );

        fechaActual.setDate(fechaActual.getDate() + 7);
        continue;
      }

      // ================= CREAR CLASE =================

      const nuevaClase = await prisma.clase.create({
        data: {
          titulo: formData.titulo,
          fechaHora: new Date(fechaActual),
          duracionMin,
          disciplinaId: formData.disciplinaId,
          profesorId: profesorEncontrado.id,
          cupoMaximo: formData.cupoMaximo,
          precio: formData.precio || 0,
          estado: "ACTIVA",
          serieId: serieId,
        },
      });

      clasesCreadas.push(nuevaClase);

      // avanzar una semana
      fechaActual.setDate(fechaActual.getDate() + 7);
    }

    return {
      success: true,
      cantidadClases: clasesCreadas.length,
      errores: erroresClases,
    };
  } catch (error) {
    console.error("Error al crear clase:", error);
    return { error: "Error al crear la clase. Intenta nuevamente." };
  }
}
