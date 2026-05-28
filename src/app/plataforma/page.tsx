import { requerirUsuarioActual } from "@/lib/sesion";
import { ContenidoPlataforma } from "../../components/ContenidoPlataforma";
import { PanelAdmin } from "../../components/admin/PanelAdmin";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Plataforma — Sportify",
  description: "Área exclusiva de Sportify.",
};

export default async function PaginaPlataforma() {
  const usuario = await requerirUsuarioActual();

  let disciplinas: Array<{ id: number; nombre: string }> = [];

  if (usuario.rol === "ADMIN") {
    disciplinas = await prisma.disciplina.findMany({
      select: { id: true, nombre: true },
      where: { activa: true },
    });
  } else {
    // Si no es ADMIN, la página de inicio de la plataforma es el cronograma
    redirect("/plataforma/cronograma");
  }

  return (
    <ContenidoPlataforma>
      <PanelAdmin disciplinas={disciplinas} />
    </ContenidoPlataforma>
  );
}