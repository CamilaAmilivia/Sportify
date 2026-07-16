"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "crypto";
import { sendInitialPasswordEmail } from "@/lib/mail";

export type RegistroProfesorState = {
  errores?: {
    dni?: string[];
    nombre?: string[];
    apellido?: string[];
    email?: string[];
    fechaNac?: string[];
  };
  valores?: {
    dni?: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    fechaNac?: string;
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
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const fechaNacStr = formData.get("fechaNac") as string;

  const valores = { dni: dniStr, nombre, apellido, email, fechaNac: fechaNacStr };
  const errores: RegistroProfesorState["errores"] = {};

  // Validaciones básicas
  if (!dniStr) {
    errores.dni = ["El DNI es requerido."];
  } else if (!/^[1-9][0-9]{6,7}$/.test(dniStr)) {
    errores.dni = ["Se debe ingresar un DNI con formato válido"];
  }
  if (!nombre) errores.nombre = ["El nombre es requerido."];
  if (!apellido) errores.apellido = ["El apellido es requerido."];
  if (!email) errores.email = ["El email es requerido."];
  if (!fechaNacStr) {
    errores.fechaNac = ["La fecha de nacimiento es requerida."];
  } else {
    const fechaNac = new Date(fechaNacStr);
    if (isNaN(fechaNac.getTime())) {
      errores.fechaNac = ["La fecha ingresada no es válida."];
    } else {
      const hoy = new Date();
      let edad = hoy.getFullYear() - fechaNac.getFullYear();
      const m = hoy.getMonth() - fechaNac.getMonth();
      if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
        edad--;
      }

      if (edad < 18) {
        errores.fechaNac = ["El profesor debe ser mayor de 18 años."];
      }
    }
  }

  // Verificar si existe el DNI o Email en BD solo si no hay errores previos en esos campos
  const promesasDb = [];

  if (!errores.dni) {
    promesasDb.push(
      prisma.usuario.findUnique({ where: { dni: Number(dniStr) } }).then((u) => {
        if (u) errores.dni = ["Ya existe un usuario con este DNI."];
      })
    );
  }

  if (!errores.email) {
    promesasDb.push(
      prisma.usuario.findUnique({ where: { email } }).then((u) => {
        if (u) errores.email = ["Ya existe un usuario con este email."];
      })
    );
  }

  await Promise.all(promesasDb);

  if (Object.keys(errores).length > 0) {
    return { errores, valores };
  }

  const dni = Number(dniStr);
  const fechaNac = new Date(fechaNacStr);

  try {
    // La contraseña inicial es vacía para forzar su creación mediante el enlace
    const password = "";

    const nuevoUsuario = await prisma.usuario.create({
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

    // Generar token persistente para la creación de la contraseña inicial
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date("9999-12-31T23:59:59.999Z");

    await prisma.passwordResetToken.create({
      data: {
        token,
        expiresAt,
        usuarioId: nuevoUsuario.id,
      },
    });

    // Enviar correo
    try {
      await sendInitialPasswordEmail(email, token);
    } catch (emailError) {
      // Revertir la creación del usuario si falla el envío del correo
      await prisma.usuario.delete({ where: { id: nuevoUsuario.id } });
      console.error("Error al enviar email de registro:", emailError);
      return {
        errores: {},
        mensaje: "No se pudo enviar el correo de registro. Por favor, verifica la configuración del servidor de correo e intenta nuevamente.",
      };
    }
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
