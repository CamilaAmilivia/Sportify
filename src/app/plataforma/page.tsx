import { requerirUsuarioActual } from "@/lib/sesion";
import { ContenidoPlataforma } from "../../components/ContenidoPlataforma";
import { PanelAdmin } from "../../components/admin/PanelAdmin"
import { PanelCliente } from "../../components/cliente/PanelCliente"
import { TituloPagina } from "../../components/ui/TituloPagina"

export const metadata = {
  title: "Plataforma — Sportify",
  description: "Área exclusiva de Sportify.",
};

export default async function PaginaPlataforma() {
  const usuario = await requerirUsuarioActual();

  return (
      <ContenidoPlataforma>
        {usuario.rol === "ADMIN" && <PanelAdmin />}

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