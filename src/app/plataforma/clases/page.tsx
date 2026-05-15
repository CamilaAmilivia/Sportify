import { requerirRol } from "@/lib/sesion";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion"
import { TarjetaAccion } from "@/components/ui/TarjetaAccion"
import { TituloPagina } from "@/components/ui/TituloPagina";
export const metadata = {
  title: "Clases — Sportify",
};

export default async function PaginaClases() {
  await requerirRol(["ADMIN"]);

  return (
    <>
      <TituloPagina
        titulo="Gestión de Clases"
        descripcion="Desde acá el administrador va a poder crear, editar, cancelar y consultar clases."
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
          titulo="Crear clase"
          descripcion="Registrar una nueva clase en el cronograma."
          href="#"
          icono="➕"
        />

        <TarjetaAccion
          titulo="Ver cronograma"
          descripcion="Consultar las clases cargadas por fecha y disciplina."
          href="#"
          icono="▣"
        />

        <TarjetaAccion
          titulo="Clases canceladas"
          descripcion="Revisar clases canceladas o finalizadas."
          href="#"
          icono="⚠️"
        />
      </div>

      <PanelConstruccion
        titulo="Listado de clases"
        descripcion="Acá luego se mostrará una tabla con las clases creadas en la base de datos."
      />
    </>
  );
}