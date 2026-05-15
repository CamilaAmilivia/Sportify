import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion";
import { TarjetaAccion } from "@/components/ui/TarjetaAccion";

export const metadata = {
  title: "Asistencia — Sportify",
};

export default async function PaginaAsistencia() {
  const usuario = await requerirRol(["ADMIN", "PROFESOR"]);

  return (
    <>
      <TituloPagina
        titulo="Asistencia"
        descripcion="Desde acá se va a poder consultar o tomar asistencia de las clases."
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {usuario.rol === "PROFESOR" && (
          <TarjetaAccion
            titulo="Tomar asistencia"
            descripcion="Registrar presentes de tus clases asignadas."
            href="#"
            icono="✅"
          />
        )}

        {usuario.rol === "ADMIN" && (
          <TarjetaAccion
            titulo="Ver asistencia general"
            descripcion="Consultar asistencia por clase, profesor o fecha."
            href="#"
            icono="▤"
          />
        )}
      </div>

      <PanelConstruccion
        titulo="Registro de asistencia"
        descripcion="Acá luego se mostrará la información de asistencia conectada a la base de datos."
      />
    </>
  );
}