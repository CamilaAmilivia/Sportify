"use server";

import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export type RegistroState = {
  errores?: {
    dni?: string[];
    nombre?: string[];
    apellido?: string[];
    email?: string[];
    password?: string[];
    fechaNac?: string[];
    aptoFisico?: string[];
  };
  mensaje?: string;
  exito?: boolean;
};

function calcularEdad(fechaNac: Date): number {
  const hoy = new Date();
  let edad = hoy.getFullYear() - fechaNac.getFullYear();
  const m = hoy.getMonth() - fechaNac.getMonth();
  if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
    edad--;
  }
  return edad;
}

export async function registrarCliente(
  _prevState: RegistroState,
  formData: FormData
): Promise<RegistroState> {
  const dni = (formData.get("dni") as string)?.trim();
  const nombre = (formData.get("nombre") as string)?.trim();
  const apellido = (formData.get("apellido") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const password = formData.get("password") as string;
  const fechaNacStr = formData.get("fechaNac") as string;
  const archivo = formData.get("aptoFisico") as File | null;

  const errores: RegistroState["errores"] = {};

  // Validaciones básicas
  if (!dni) errores.dni = ["El DNI es requerido."];
  if (!nombre) errores.nombre = ["El nombre es requerido."];
  if (!apellido) errores.apellido = ["El apellido es requerido."];
  if (!email) errores.email = ["El email es requerido."];
  if (!password || password.length < 6)
    errores.password = ["La contraseña debe tener al menos 6 caracteres."];

  // Validar fecha de nacimiento
  if (!fechaNacStr) {
    errores.fechaNac = ["La fecha de nacimiento es requerida."];
  } else {
    const fechaNac = new Date(fechaNacStr);
    if (isNaN(fechaNac.getTime())) {
      errores.fechaNac = ["La fecha ingresada no es válida."];
    } else if (calcularEdad(fechaNac) < 16) {
      errores.fechaNac = ["El cliente debe ser mayor de 16 años."];
    }
  }

  // Validar archivo apto físico
  if (!archivo || archivo.size === 0) {
    errores.aptoFisico = ["Debe adjuntar el certificado de aptitud física."];
  }

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  // Verificar unicidad de DNI y email en la BD
  const [dniExistente, emailExistente] = await Promise.all([
    prisma.cliente.findUnique({ where: { dni } }),
    prisma.cliente.findUnique({ where: { email } }),
  ]);

  if (dniExistente) errores.dni = ["Este DNI ya está registrado."];
  if (emailExistente) errores.email = ["Este email ya está registrado."];

  if (Object.keys(errores).length > 0) {
    return { errores };
  }

  // Guardar archivo en public/uploads
  const ext = path.extname(archivo!.name) || ".pdf";
  const nombreArchivo = `${dni}_aptofisico${ext}`;
  const dirDestino = path.join(process.cwd(), "public", "uploads");
  const rutaDestino = path.join(dirDestino, nombreArchivo);

  await mkdir(dirDestino, { recursive: true });
  const buffer = Buffer.from(await archivo!.arrayBuffer());
  await writeFile(rutaDestino, buffer);

  // Crear cliente en la BD
  const fechaNac = new Date(fechaNacStr);
  await prisma.cliente.create({
    data: {
      dni,
      nombre,
      apellido,
      email,
      password, // En producción debería hashearse (ej. con bcrypt)
      fechaNac,
      aptoFisico: `/uploads/${nombreArchivo}`,
    },
  });

  return { exito: true, mensaje: "Cliente registrado correctamente." };
}
