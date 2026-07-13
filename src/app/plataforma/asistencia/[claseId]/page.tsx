import { requerirRol } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { TituloPagina } from "@/components/ui/TituloPagina";
import Link from "next/link";
import { GeneradorQR } from "./GeneradorQR";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Tomar Asistencia — Sportify",
};

export default async function ClaseAsistenciaPage({
  params,
}: {
  params: Promise<{ claseId: string }>;
}) {
  const usuario = await requerirRol(["PROFESOR"]);
  
  // En Next.js 15, params es una Promise
  const resolvedParams = await params;
  const claseId = parseInt(resolvedParams.claseId, 10);

  if (isNaN(claseId)) {
    notFound();
  }

  const clase = await prisma.clase.findUnique({
    where: { id: claseId },
    include: { disciplina: true },
  });

  if (!clase) {
    notFound();
  }

  if (clase.profesorId !== usuario.id) {
    return (
      <>
        <TituloPagina titulo="Error" descripcion="Acceso denegado" />
        <p>No tenés permiso para tomar asistencia en esta clase.</p>
        <Link href="/plataforma/mis-clases" style={{ color: "#22c55e", fontWeight: "bold" }}>
          Volver a Mis clases
        </Link>
      </>
    );
  }

  const claseTerminada = new Date() >= new Date(clase.fechaHora.getTime() + clase.duracionMin * 60000);

  return (
    <>
      <TituloPagina
        titulo={`Asistencia: ${clase.titulo}`}
        descripcion={`Clase de ${clase.disciplina.nombre}`}
      />

      <Link
        href="/plataforma/mis-clases"
        style={{
          display: "inline-block",
          marginBottom: 24,
          color: "#16a34a",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        ← Volver a mis clases
      </Link>

      <GeneradorQR claseId={clase.id} claseTerminada={claseTerminada} />
    </>
  );
}
