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
  requiereCambioPassword?: boolean;
  emailConfirmado?: string;
  passwordActual?: string;
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
          general: ["Credenciales incorrectas."],
        },
      };
    }

    // Comprobar contraseña (actualmente en texto plano según el registro)
    if (cliente.password !== password) {
      return {
        errores: {
          general: ["Credenciales incorrectas."],
        },
      };
    }

    if (cliente.rol === "PROFESOR" && cliente.password === cliente.dni.toString()) {
      return {
        requiereCambioPassword: true,
        emailConfirmado: cliente.email,
        passwordActual: password,
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

    redirectUrl = "/plataforma/cronograma";
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

export type CambioPasswordState = {
  errores?: {
    passwordNueva?: string[];
    passwordNuevaConfirmacion?: string[];
    general?: string[];
  };
  mensaje?: string;
  exito?: boolean;
};

export async function cambiarPasswordPrimerLogin(
  _prevState: CambioPasswordState,
  formData: FormData
): Promise<CambioPasswordState> {
  const email = formData.get("email") as string;
  const passwordActual = formData.get("passwordActual") as string;
  const passwordNueva = formData.get("passwordNueva") as string;
  const passwordNuevaConfirmacion = formData.get("passwordNuevaConfirmacion") as string;

  const errores: CambioPasswordState["errores"] = {};

  if (!passwordNueva || passwordNueva.length < 6) {
    errores.passwordNueva = ["La contraseña debe tener al menos 6 caracteres."];
  }
  if (passwordNueva !== passwordNuevaConfirmacion) {
    errores.passwordNuevaConfirmacion = ["Las contraseñas no coinciden."];
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  let redirectUrl: string | null = null;

  try {
    const cliente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!cliente || cliente.password !== passwordActual) {
      return {
        errores: {
          general: ["Las credenciales originales no son válidas. Por favor, intentá iniciar sesión nuevamente."],
        },
      };
    }

    await prisma.usuario.update({
      where: { id: cliente.id },
      data: { password: passwordNueva },
    });

    // Crear cookie de sesión
    const cookieStore = await cookies();
    cookieStore.set("sportify_session", cliente.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 días
    });

    redirectUrl = "/plataforma/cronograma";
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return {
      errores: {
        general: ["Ocurrió un error al intentar cambiar la contraseña. Por favor, intentá nuevamente."],
      },
    };
  }

  if (redirectUrl) {
    redirect(redirectUrl);
  }

  return {};
}
