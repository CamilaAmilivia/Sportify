import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requerirUsuarioActual } from "@/lib/sesion";

/**
 * GET /api/asistencia/verificar?claseId=123
 * Devuelve si el usuario actual ya registró asistencia para la clase dada.
 */
export async function GET(req: NextRequest) {
  try {
    const usuario = await requerirUsuarioActual();
    const claseId = Number(req.nextUrl.searchParams.get("claseId"));

    if (!claseId || isNaN(claseId)) {
      return NextResponse.json({ error: "claseId inválido" }, { status: 400 });
    }

    const asistencia = await prisma.asistencia.findUnique({
      where: {
        usuarioId_claseId: {
          usuarioId: usuario.id,
          claseId,
        },
      },
    });

    return NextResponse.json({ registrada: !!(asistencia?.presente) });
  } catch {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
}
