import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const claseId = Number(searchParams.get("claseId"));

    if (!claseId || isNaN(claseId)) {
      return NextResponse.json({ error: "claseId inválido" }, { status: 400 });
    }

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
      select: { qrActivo: true },
    });

    if (!clase) {
      return NextResponse.json({ qrActivo: false });
    }

    return NextResponse.json({ qrActivo: clase.qrActivo });
  } catch (error) {
    console.error("Error consultando qrActivo:", error);
    return NextResponse.json({ qrActivo: false });
  }
}
