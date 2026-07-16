"use server";

import { prisma } from "@/lib/prisma";

export type CrearState = {
  errores?: {
    password?: string[];
    confirmPassword?: string[];
  };
  mensaje?: string;
  exito?: boolean;
};

// Polling action
export async function checkTokenValidity(token: string): Promise<boolean> {
  if (!token) return false;

  const validToken = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!validToken) return false;

  // The initial password token has a far future expiration, but we verify just in case
  if (validToken.expiresAt < new Date()) {
    return false;
  }

  return true;
}

export async function crearPassword(
  _prevState: CrearState,
  formData: FormData
): Promise<CrearState> {
  const token = formData.get("token") as string;
  const password = (formData.get("password") as string)?.trim();
  const confirmPassword = (formData.get("confirmPassword") as string)?.trim();

  const errores: CrearState["errores"] = {};

  if (!password || password.length < 6) {
    errores.password = ["La contraseña debe tener al menos 6 caracteres."];
  }

  if (password !== confirmPassword) {
    errores.confirmPassword = ["Las contraseñas no coinciden."];
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  try {
    const validToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!validToken) {
      return { mensaje: "El enlace es inválido. Por favor contacta al administrador." };
    }

    if (validToken.expiresAt < new Date()) {
      return { mensaje: "El enlace ha expirado. Por favor contacta al administrador." };
    }

    // Actualizar la contraseña del usuario (actualmente en texto plano según el resto de la app)
    await prisma.usuario.update({
      where: { id: validToken.usuarioId },
      data: { password },
    });

    // Invalidar token (borrarlo)
    await prisma.passwordResetToken.delete({
      where: { id: validToken.id },
    });

    return { exito: true };
  } catch (error) {
    console.error("Error al crear contraseña:", error);
    return { mensaje: "Ocurrió un error al intentar crear la contraseña." };
  }
}
