"use server";

import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { sendPasswordResetEmail } from "@/lib/mail";

export type RecuperarState = {
  errores?: {
    email?: string[];
  };
  mensaje?: string;
  exito?: boolean;
};

export async function solicitarRecuperacion(
  _prevState: RecuperarState,
  formData: FormData
): Promise<RecuperarState> {
  const email = (formData.get("email") as string)?.trim();

  if (!email) {
    return { errores: { email: ["El correo electrónico es requerido."] } };
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuario) {
      if (usuario.password === "") {
        return {
          mensaje: "Aún no has creado tu contraseña inicial. Por favor revisa el enlace enviado a tu correo electrónico al ser registrado.",
        };
      }

      // 1. Invalidar (borrar) cualquier token anterior de este usuario
      await prisma.passwordResetToken.deleteMany({
        where: { usuarioId: usuario.id },
      });

      // 2. Crear nuevo token
      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora de validez

      await prisma.passwordResetToken.create({
        data: {
          token,
          expiresAt,
          usuarioId: usuario.id,
        },
      });

      // 3. Enviar correo
      try {
        await sendPasswordResetEmail(usuario.email, token);
      } catch (emailError) {
        console.error("Error al enviar email de recuperación:", emailError);
        return { mensaje: "No se pudo enviar el correo de recuperación. Por favor, verifica la configuración del servidor de correo." };
      }
    }

    // Siempre devolvemos éxito incluso si el usuario no existe, para evitar enumeración de usuarios
    return { exito: true };
  } catch (error) {
    console.error("Error al solicitar recuperación:", error);
    return { mensaje: "Ocurrió un error al procesar la solicitud. Intente nuevamente." };
  }
}
