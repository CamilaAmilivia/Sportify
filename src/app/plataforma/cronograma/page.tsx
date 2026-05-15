import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion";
import { TarjetaAccion } from "@/components/ui/TarjetaAccion";

export const metadata = {
  title: "Cronograma — Sportify",
};

export default async function PaginaCronograma() {
  await requerirRol(["CLIENTE"]);

  return (
    <>
      <TituloPagina
        titulo="Cronograma"
        descripcion="Consultá las clases disponibles e inscribite según cupo."
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
          titulo="Yoga"
          descripcion="Ver clases disponibles de yoga."
          href="#"
          icono="🧘"
        />

        <TarjetaAccion
          titulo="Pilates"
          descripcion="Ver clases disponibles de pilates."
          href="#"
          icono="🤸"
        />

        <TarjetaAccion
          titulo="Funcional"
          descripcion="Ver clases disponibles de funcional."
          href="#"
          icono="🏋️"
        />
      </div>

      <PanelConstruccion
        titulo="Calendario de clases"
        descripcion="Acá luego se mostrará el calendario real de clases desde la base de datos."
      />
    </>
  );
}