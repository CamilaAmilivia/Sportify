import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion";
import { TarjetaAccion } from "@/components/ui/TarjetaAccion";

export const metadata = {
  title: "Profesores — Sportify",
};

export default async function PaginaProfesores() {
  await requerirRol(["ADMIN"]);

  return (
    <>
      <TituloPagina
        titulo="Gestión de profesores"
        descripcion="Desde acá el administrador va a poder registrar profesores y asignarlos a clases."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <TarjetaAccion
          titulo="Registrar profesor"
          descripcion="Crear un nuevo usuario con rol profesor."
          href="/plataforma/profesores/registrar"
          icono="🧑‍🏫"
        />

        <TarjetaAccion
          titulo="Asignar clases"
          descripcion="Vincular profesores con clases existentes."
          href="#"
          icono="▣"
        />
      </div>

      <PanelConstruccion
        titulo="Listado de profesores"
        descripcion="Acá luego se mostrará una tabla con los usuarios que tengan rol PROFESOR."
      />
    </>
  );
}