import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requerirRol } from "@/lib/sesion";

export async function POST(request: Request) {
  try {
    const usuario = await requerirRol(["PROFESOR"]);
    const body = await request.json();

    const claseId = body.claseId;
    const activo = body.activo;

    if (typeof claseId !== "number" || typeof activo !== "boolean") {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!clase) {
      return NextResponse.json({ error: "Clase no encontrada" }, { status: 404 });
    }

    if (clase.profesorId !== usuario.id) {
      return NextResponse.json({ error: "No sos el profesor de esta clase" }, { status: 403 });
    }

    await prisma.clase.update({
      where: { id: claseId },
      data: { qrActivo: activo },
    });

    return NextResponse.json({ ok: true, qrActivo: activo });
  } catch (error) {
    console.error("Error actualizando estado del QR:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
