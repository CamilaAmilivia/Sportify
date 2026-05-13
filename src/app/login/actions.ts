"use server";

import { prisma } from "@/lib/prisma";

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

  try {
    // Buscar el cliente por email
    const cliente = await prisma.cliente.findUnique({
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

    // Éxito: según los requerimientos, todavía no hace nada (ej. setear cookies/sesión)
    return {
      exito: true,
      mensaje: "¡Sesión iniciada correctamente!",
    };
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return {
      errores: {
        general: ["Ocurrió un error al intentar iniciar sesión. Por favor, intentá nuevamente."],
      },
    };
  }
}
