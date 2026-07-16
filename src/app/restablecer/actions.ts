"use server";

import { prisma } from "@/lib/prisma";

export type RestablecerState = {
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

  // Check expiration
  if (validToken.expiresAt < new Date()) {
    return false;
  }

  return true;
}

export async function restablecerContrasena(
  _prevState: RestablecerState,
  formData: FormData
): Promise<RestablecerState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  const errores: RestablecerState["errores"] = {};

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
      return { mensaje: "El enlace es inválido. Por favor solicita uno nuevo." };
    }

    if (validToken.expiresAt < new Date()) {
      return { mensaje: "El enlace es inválido. Por favor solicita uno nuevo." };
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
    console.error("Error al restablecer contraseña:", error);
    return { mensaje: "Ocurrió un error al restablecer la contraseña." };
  }
}
