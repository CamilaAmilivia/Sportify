"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type RegistroProfesorState = {
  errores?: {
    dni?: string[];
    nombre?: string[];
    apellido?: string[];
    email?: string[];
    fechaNac?: string[];
  };
  mensaje?: string;
  exito?: boolean;
};

export async function registrarProfesor(
  prevState: RegistroProfesorState,
  formData: FormData
): Promise<RegistroProfesorState> {
  const dniStr = (formData.get("dni") as string)?.trim();
  const nombre = (formData.get("nombre") as string)?.trim();
  const apellido = (formData.get("apellido") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const fechaNacStr = formData.get("fechaNac") as string;

  const errores: RegistroProfesorState["errores"] = {};

  // Validaciones básicas
  if (!dniStr) errores.dni = ["El DNI es requerido."];
  if (!nombre) errores.nombre = ["El nombre es requerido."];
  if (!apellido) errores.apellido = ["El apellido es requerido."];
  if (!email) errores.email = ["El email es requerido."];
  if (!fechaNacStr) errores.fechaNac = ["La fecha de nacimiento es requerida."];

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  const dni = Number(dniStr);
  const fechaNac = new Date(fechaNacStr);

  if (isNaN(dni) || dniStr.length < 7 || dniStr.length > 8) {
    errores.dni = ["El DNI debe ser un número válido de 7 u 8 dígitos."];
  }

  if (isNaN(fechaNac.getTime())) {
    errores.fechaNac = ["La fecha ingresada no es válida."];
  } else {
    const hoy = new Date();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }

    if (fechaNac > hoy) {
      errores.fechaNac = ["La fecha de nacimiento no puede estar en el futuro."];
    } else if (edad < 18) {
      errores.fechaNac = ["El profesor debe ser mayor de 18 años."];
    }
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  // Verificar si existe el DNI o Email
  const [usuarioPorDni, usuarioPorEmail] = await Promise.all([
    prisma.usuario.findUnique({ where: { dni } }),
    prisma.usuario.findUnique({ where: { email } }),
  ]);

  if (usuarioPorDni) {
    errores.dni = ["Ya existe un usuario con este DNI."];
  }
  if (usuarioPorEmail) {
    errores.email = ["Ya existe un usuario con este email."];
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  try {
    // La contraseña por defecto es el DNI
    // NOTA: En un entorno real se debe hacer hash de la contraseña (ej. con bcrypt)
    const password = dniStr;

    await prisma.usuario.create({
      data: {
        dni,
        nombre,
        apellido,
        email,
        password,
        fechaNac,
        rol: "PROFESOR",
        activo: true,
      },
    });
  } catch (error) {
    console.error("Error al registrar profesor:", error);
    return {
      errores: {},
      mensaje: "Ocurrió un error inesperado al guardar en la base de datos.",
    };
  }

  revalidatePath("/plataforma/profesores");
  return {
    exito: true,
    mensaje: "Profesor registrado exitosamente.",
  };
}
