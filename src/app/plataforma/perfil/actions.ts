"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { obtenerUsuarioActual } from "@/lib/sesion";

export type CambioEmailState = {
  errores?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
  mensaje?: string;
  exito?: boolean;
};

export async function cambiarEmail(
  _prevState: CambioEmailState,
  formData: FormData
): Promise<CambioEmailState> {
  const nuevoEmail = (formData.get("nuevoEmail") as string)?.trim();
  const password = formData.get("password") as string;

  const errores: CambioEmailState["errores"] = {};

  if (!nuevoEmail) {
    errores.email = ["El nuevo correo es requerido."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(nuevoEmail)) {
    errores.email = ["El formato del correo es inválido."];
  }

  if (!password) {
    errores.password = ["La contraseña actual es requerida."];
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  try {
    const usuarioSesion = await obtenerUsuarioActual();
    
    if (!usuarioSesion) {
        return {
            errores: { general: ["No hay una sesión activa."] }
        }
    }

    if (nuevoEmail.toLowerCase() === usuarioSesion.email.toLowerCase()) {
        return {
            errores: { email: ["El nuevo correo debe ser diferente al actual."] }
        }
    }

    // Obtener el usuario completo para validar la contraseña
    const usuarioBD = await prisma.usuario.findUnique({
      where: { id: usuarioSesion.id },
    });

    if (!usuarioBD) {
      return {
        errores: { general: ["Usuario no encontrado."] },
      };
    }

    // Comprobar contraseña (actualmente en texto plano según el registro)
    if (usuarioBD.password !== password) {
      return {
        errores: { password: ["La contraseña es incorrecta."] },
      };
    }

    // Verificar si el nuevo email ya existe
    const emailExistente = await prisma.usuario.findUnique({
      where: { email: nuevoEmail },
    });

    if (emailExistente) {
      return {
        errores: { email: ["El correo ingresado ya está registrado."] },
      };
    }

    // Actualizar el email en la base de datos
    await prisma.usuario.update({
      where: { id: usuarioSesion.id },
      data: { email: nuevoEmail },
    });

    // Eliminar la cookie de sesión
    const cookieStore = await cookies();
    cookieStore.delete("sportify_session");

  } catch (error) {
    console.error("Error al cambiar email:", error);
    return {
      errores: {
        general: ["Ocurrió un error al intentar actualizar el correo. Por favor, intentá nuevamente."],
      },
    };
  }

  // Redirigir fuera del bloque try/catch
  redirect("/login?mensaje=Email actualizado exitosamente. Por favor, iniciá sesión nuevamente.");
}
