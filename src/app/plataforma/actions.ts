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
  profesor: string;
  fechaHora: string;
  horaInicio: string;
  horaFin: string;
  disciplinaId: number;
  cupoMaximo: number;
  precio?: number;
}) {
  try {
    // Validar datos básicos
    if (!formData.titulo || !formData.profesor || !formData.fechaHora || !formData.horaInicio || !formData.horaFin) {
      return { error: "Faltan datos requeridos" };
    }

    // Buscar profesor por nombre o crear uno temporal
    // Por ahora buscamos por nombre, si no existe retornamos error
    const profesorEncontrado = await prisma.usuario.findFirst({
      where: {
        nombre: formData.profesor,
        rol: "PROFESOR",
      },
    });

    if (!profesorEncontrado) {
      return { error: `Profesor "${formData.profesor}" no encontrado en el sistema` };
    }

    // Combinar fecha e hora de inicio
    const [horaInicioH, horaInicioM] = formData.horaInicio.split(":").map(Number);
    const [horaFinH, horaFinM] = formData.horaFin.split(":").map(Number);

    const fechaInicio = new Date(formData.fechaHora);
    fechaInicio.setHours(horaInicioH, horaInicioM, 0, 0);

    const fechaFin = new Date(formData.fechaHora);
    fechaFin.setHours(horaFinH, horaFinM, 0, 0);

    // Calcular duración en minutos
    const duracionMin = Math.round((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60));

    if (duracionMin <= 0) {
      return { error: "La hora de fin debe ser posterior a la hora de inicio" };
    }

    // Crear clase
    const nuevaClase = await prisma.clase.create({
      data: {
        titulo: formData.titulo,
        fechaHora: fechaInicio,
        duracionMin,
        disciplinaId: formData.disciplinaId,
        profesorId: profesorEncontrado.id,
        cupoMaximo: formData.cupoMaximo,
        precio: formData.precio || 0,
        estado: "ACTIVA",
      },
    });

    return { success: true, claseId: nuevaClase.id };
  } catch (error) {
    console.error("Error al crear clase:", error);
    return { error: "Error al crear la clase. Intenta nuevamente." };
  }
}
