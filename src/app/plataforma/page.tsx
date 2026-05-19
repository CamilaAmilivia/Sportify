import { requerirUsuarioActual } from "@/lib/sesion";
import { ContenidoPlataforma } from "../../components/ContenidoPlataforma";
import { PanelAdmin } from "../../components/admin/PanelAdmin"
import { PanelCliente } from "../../components/cliente/PanelCliente"
import { TituloPagina } from "../../components/ui/TituloPagina"
import { prisma } from "@/lib/prisma";

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
  }

  return (
      <ContenidoPlataforma>
        {usuario.rol === "ADMIN" && <PanelAdmin disciplinas={disciplinas} />}

        {usuario.rol === "CLIENTE" && <PanelCliente />}

        {usuario.rol === "PROFESOR" && (
          <TituloPagina
            titulo="Panel del Profesor"
            descripcion="Desde acá vas a poder ver tus clases asignadas y tomar asistencia."
          />
        )}
      </ContenidoPlataforma>
  );
}