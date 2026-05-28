"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function cerrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete("sportify_session");
  redirect("/login");
}

export async function crearClase(formData: {
  titulo: string;
  profesorId: number;
  fechaHora: string;
  horaInicio: string;
  horaFin: string;
  disciplinaId: number;
  cupoMaximo: number;
  precio?: number;
}) {
  try {
    // Validar datos básicos
    if (!formData.titulo) {
      return { error: "El título de la clase es requerido" };
    }
    if (!formData.profesorId || isNaN(formData.profesorId)) {
      return { error: "Debes seleccionar un profesor" };
    }
    if (!formData.fechaHora) {
      return { error: "La fecha es requerida" };
    }
    if (!formData.horaInicio) {
      return { error: "La hora de inicio es requerida" };
    }
    if (!formData.horaFin) {
      return { error: "La hora de fin es requerida" };
    }

    // Buscar profesor por ID
    const profesorEncontrado = await prisma.usuario.findUnique({
      where: {
        id: formData.profesorId,
      },
    });

    if (!profesorEncontrado) {
      return { error: `Profesor con ID "${formData.profesorId}" no encontrado en el sistema` };
    }

    // Validar que sea profesor
    if (profesorEncontrado.rol !== "PROFESOR") {
      return { error: "El usuario seleccionado no es un profesor" };
    }

    // Combinar fecha e hora de inicio
    const [horaInicioH, horaInicioM] = formData.horaInicio.split(":").map(Number);
    const [horaFinH, horaFinM] = formData.horaFin.split(":").map(Number);

    // Parsear fecha en formato dd/mm/yyyy
    const [dia, mes, anio] = formData.fechaHora.split("/").map(Number);
    
    if (!dia || !mes || !anio) {
      return { error: "Fecha inválida. Usa formato DD/MM/YYYY" };
    }

    if (anio < 2000 || anio > 2099) {
      return { error: "El año debe estar entre 2000 y 2099" };
    }

    // Validar mes
    if (mes < 1 || mes > 12) {
      return { error: "El mes debe estar entre 01 y 12" };
    }

    // Validar día considerando cantidad de días en cada mes y años bisiestos
    const esBisiesto = (year: number) => {
      return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    };

    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (esBisiesto(anio)) {
      diasPorMes[1] = 29; // Febrero en año bisiesto
    }

    const diasEnMes = diasPorMes[mes - 1];

    if (dia < 1 || dia > diasEnMes) {
      const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
      return { error: `El día debe estar entre 01 y ${diasEnMes} para ${meses[mes - 1]} de ${anio}` };
    }

    // Crear fecha de forma segura
    const fechaInicio = new Date(anio, mes - 1, dia);
    
    
    // Verificar que la fecha creada corresponda realmente a los valores ingresados
    if (fechaInicio.getFullYear() !== anio || fechaInicio.getMonth() !== mes - 1 || fechaInicio.getDate() !== dia) {
      return { error: "Fecha inválida" };
    }
    
    fechaInicio.setHours(horaInicioH, horaInicioM, 0, 0);
    
    const ahora = Date.now();

    if (fechaInicio.getTime() <= ahora) {
      return {error: "La fecha y hora de la clase no puede ser anterior al momento actual",
  };
}

    const fechaFin = new Date(anio, mes - 1, dia);
    fechaFin.setHours(horaFinH, horaFinM, 0, 0);

    // Calcular duración en minutos
    const duracionMin = Math.round((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60));

    if (duracionMin <= 0) {
      return { error: "La hora de fin debe ser posterior a la hora de inicio" };
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
      return {
        error: `${profesorEncontrado.nombre} ya tiene una clase asignada en el horario ${formData.horaInicio} - ${formData.horaFin}`,
      };
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

    // Obtener nombre de la disciplina que queremos agregar
    const disciplinaActual = await prisma.disciplina.findUnique({
      where: { id: formData.disciplinaId },
    });

    if (!disciplinaActual) {
      return { error: "La disciplina seleccionada no existe" };
    }

    // Validar si agregar una nueva disciplina excedería el límite
    if (disciplinasEnHorario.size >= 3 && !disciplinasEnHorario.has(disciplinaActual.nombre)) {
      return {
        error: `No se pueden agregar más de 3 disciplinas diferentes en el mismo horario. 
        Actualmente hay: ${Array.from(disciplinasEnHorario).join(", ")}`,
      };
    }

    // Validación 2: Suma total de cupos no puede exceder 30
    const cuposActuales = clasesEnMismoHorario.reduce(
      (sum, clase) => sum + clase.cupoMaximo,
      0
    );

    const cuposTotales = cuposActuales + formData.cupoMaximo;

    if (cuposTotales > 30) {
      return {
        error: `La suma de cupos máximos no puede exceder 30. 
        Cupo actual en horario: ${cuposActuales}. 
        Tu clase: ${formData.cupoMaximo}. 
        Total: ${cuposTotales} (Máximo: 30)`,
      };
    }

    // ============= FIN DE NUEVAS VALIDACIONES =============

    // Validar para cada clase individualmente 
const clasesCreadas = [];
const errores: string[] = [];

const fechaActual = new Date(fechaInicio);

const formatearFecha = (fecha: Date) =>
  fecha.toLocaleDateString("es-AR");

while (fechaActual.getMonth() === fechaInicio.getMonth()) {

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
  errores.push(
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
  errores.push(
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
  errores.push(
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
    },
  });

  clasesCreadas.push(nuevaClase);

  // avanzar una semana
  fechaActual.setDate(fechaActual.getDate() + 7);
}

return {
  success: true,
  cantidadClases: clasesCreadas.length,
  errores,
};
  } catch (error) {
    console.error("Error al crear clase:", error);
    return { error: "Error al crear la clase. Intenta nuevamente." };
  }
}
