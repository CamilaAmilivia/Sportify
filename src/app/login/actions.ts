"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type LoginState = {
  errores?: {
    email?: string[];
    password?: string[];
    general?: string[];
  };
  mensaje?: string;
  exito?: boolean;
};

export async function iniciarSesion(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;

  const errores: LoginState["errores"] = {};

  if (!email) {
    errores.email = ["El email es requerido."];
  }
  if (!password) {
    errores.password = ["La contraseña es requerida."];
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  let redirectUrl: string | null = null;

  try {
    // Buscar el cliente por email
    const cliente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!cliente) {
      return {
        errores: {
          general: ["Credenciales incorrectas. Verificá tu email y contraseña."],
        },
      };
    }

    // Comprobar contraseña (actualmente en texto plano según el registro)
    if (cliente.password !== password) {
      return {
        errores: {
          general: ["Credenciales incorrectas. Verificá tu email y contraseña."],
        },
      };
    }

    // Crear cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set("sportify_session", cliente.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    redirectUrl = "/plataforma";
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return {
      errores: {
        general: ["Ocurrió un error al intentar iniciar sesión. Por favor, intentá nuevamente."],
      },
    };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return {};
}
