import { requerirRol } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { jwtVerify } from "jose";
import Link from "next/link";

export const metadata = {
  title: "Escanear Asistencia — Sportify",
};

export default async function EscanearPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const usuario = await requerirRol(["CLIENTE"]);
  const { token } = await searchParams;

  if (!token) {
    return (
      <>
        <TituloPagina titulo="Error" descripcion="Token inválido" />
        <p>No se proporcionó un token de asistencia.</p>
        <Link href="/plataforma" style={{ color: "#22c55e", fontWeight: "bold" }}>
          Ir al inicio
        </Link>
      </>
    );
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default_secret_for_dev_only");

    // Verificar token y expiración
    const { payload } = await jwtVerify(token, secret);
    const claseId = payload.claseId as number;

    if (!claseId) {
      throw new Error("Token sin claseId");
    }

    const clase = await prisma.clase.findUnique({
      where: { id: claseId },
      include: { disciplina: true },
    });

    if (!clase) {
      throw new Error("Clase no encontrada");
    }

    if (!clase.qrActivo) {
      return (
        <>
          <TituloPagina titulo="Asistencia cerrada" descripcion="El profesor cerró la toma de asistencia" />
          <div style={{ color: "#dc2626", background: "#fef2f2", padding: 16, borderRadius: 8, border: "1px solid #fecaca" }}>
            El profesor ha cerrado la toma de asistencia para esta clase (probablemente cerró la pantalla). Pedile que la vuelva a abrir si todavía estás a tiempo.
          </div>
          <br />
          <Link href="/plataforma" style={{ color: "#22c55e", fontWeight: "bold" }}>
            Volver al inicio
          </Link>
        </>
      );
    }

    // Validar Inscripcion
    const inscripcion = await prisma.inscripcion.findFirst({
      where: {
        usuarioId: usuario.id,
        claseId: claseId,
        estado: "ACTIVA",
      },
    });

    if (!inscripcion) {
      return (
        <>
          <TituloPagina titulo="Acceso denegado" descripcion="No estás inscripto en esta clase" />
          <div style={{ color: "#dc2626", background: "#fef2f2", padding: 16, borderRadius: 8, border: "1px solid #fecaca" }}>
            No pudimos registrar tu asistencia porque no tenés una inscripción activa para la clase de <strong>{clase.titulo}</strong>.
          </div>
          <br />
          <Link href="/plataforma/cronograma" style={{ color: "#22c55e", fontWeight: "bold" }}>
            Ver cronograma para inscribirte
          </Link>
        </>
      );
    }

    // Registrar Asistencia
    await prisma.asistencia.upsert({
      where: {
        usuarioId_claseId: {
          usuarioId: usuario.id,
          claseId: claseId,
        },
      },
      update: {
        presente: true,
      },
      create: {
        usuarioId: usuario.id,
        claseId: claseId,
        presente: true,
      },
    });

    return (
      <>
        <TituloPagina titulo="¡Asistencia registrada!" descripcion="Que disfrutes la clase" />
        <div style={{ color: "#166534", background: "#f0fdf4", padding: 24, borderRadius: 8, border: "1px solid #bbf7d0", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <h2 style={{ fontSize: 24, marginBottom: 8 }}>Presente confirmado</h2>
          <p>
            Te registraste exitosamente en <strong>{clase.titulo}</strong> de {clase.disciplina.nombre}.
          </p>
        </div>
        <br />
        <Link href="/plataforma" style={{ color: "#22c55e", fontWeight: "bold" }}>
          Volver al inicio
        </Link>
      </>
    );

  } catch (error: any) {
    console.error("Error al verificar token de asistencia:", error);

    const esExpirado = error.code === "ERR_JWT_EXPIRED";
    const mensaje = esExpirado
      ? "El código QR ha expirado."
      : "El código QR es inválido o no se pudo procesar.";

    return (
      <>
        <TituloPagina titulo="Error al escanear" descripcion="No se pudo registrar la asistencia" />
        <div style={{ color: "#dc2626", background: "#fef2f2", padding: 16, borderRadius: 8, border: "1px solid #fecaca" }}>
          {mensaje}
        </div>
        <br />
        <Link href="/plataforma" style={{ color: "#22c55e", fontWeight: "bold" }}>
          Ir al inicio
        </Link>
      </>
    );
  }
}
