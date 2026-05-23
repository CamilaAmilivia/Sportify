import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requerirRol } from "@/lib/sesion";
import { SignJWT } from "jose";

export async function GET(request: Request) {
  try {
    const usuario = await requerirRol(["PROFESOR"]);

    const { searchParams } = new URL(request.url);
    const claseIdParam = searchParams.get("claseId");

    if (!claseIdParam) {
      return NextResponse.json({ error: "Falta claseId" }, { status: 400 });
    }

    const claseId = parseInt(claseIdParam, 10);

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!clase) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
    }

    if (clase.profesorId !== usuario.id) {
      return NextResponse.json({ error: "No sos el profesor de esta clase" }, { status: 403 });
    }

    // Validación de ventana de tiempo: 10 mins antes hasta fin de clase + 30 mins
    const ahora = new Date();
    const inicioVentana = new Date(clase.fechaHora.getTime() - 10 * 60000);
    const finVentana = new Date(clase.fechaHora.getTime() + (clase.duracionMin + 30) * 60000);

    if (ahora < inicioVentana || ahora > finVentana) {
      return NextResponse.json({ error: "No se puede tomar asistencia fuera del horario de la clase" }, { status: 403 });
    }

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_for_dev_only");

    // Token estático que expira en 4 horas
    const token = await new SignJWT({ claseId })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("4h")
      .sign(secret);

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generando token de asistencia:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
