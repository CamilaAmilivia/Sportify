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
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const fechaNacStr = formData.get("fechaNac") as string;
  const archivo = formData.get("aptoFisico") as File | null;

  const errores: RegistroState["errores"] = {};

  // Validaciones básicas
  if (!dni) {
    errores.dni = ["El DNI es requerido."];
  } else if (!/^[1-9][0-9]{6,7}$/.test(dni)) {
    errores.dni = ["Se debe ingresar un DNI con formato válido"];
  }
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
  } else {
    const mimetypesPermitidos = ["application/pdf", "image/jpeg", "image/png"];
    const extensionesPermitidas = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = path.extname(archivo.name).toLowerCase();

    if (!mimetypesPermitidos.includes(archivo.type)) {
      errores.aptoFisico = ["Formato de archivo no válido. Solo se permiten PDF, JPG o PNG."];
    } else if (!extensionesPermitidas.includes(ext)) {
      errores.aptoFisico = ["La extensión del archivo no es válida. Solo se permiten .pdf, .jpg, .jpeg o .png."];
    }
  }

  const valores: RegistroState["valores"] = { dni, nombre, apellido, email, fechaNac: fechaNacStr };

  // Verificar unicidad en la BD solo si no hay errores previos en esos campos
  const promesasDb = [];

  if (!errores.dni) {
    promesasDb.push(
      prisma.usuario.count({ where: { dni: Number(dni) } }).then((count) => {
        if (count > 0) errores.dni = ["Ya existe un usuario registrado con ese DNI."];
      })
    );
  }

  if (!errores.email) {
    promesasDb.push(
      prisma.usuario.findUnique({ where: { email } }).then((usuario) => {
        if (usuario) errores.email = ["Este email ya está registrado."];
      })
    );
  }

  await Promise.all(promesasDb);

  if (Object.keys(errores).length > 0) {
    return { errores, valores };
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
  await prisma.usuario.create({
    data: {
      dni: Number(dni),
      nombre,
      apellido,
      email,
      password, // En producción debería hashearse (ej. con bcrypt)
      fechaNac,
      aptoFisico: `/uploads/${nombreArchivo}`,
      rol: "CLIENTE",
      activo: true,
    },
  });

  return { exito: true, mensaje: "Cliente registrado correctamente." };
}
