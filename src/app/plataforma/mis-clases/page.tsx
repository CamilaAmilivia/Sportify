import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion";
import { TarjetaEstadistica } from "@/components/ui/TarjetaEstadistica";

export const metadata = {
  title: "Mis Clases — Sportify",
};

export default async function PaginaMisClases() {
  await requerirRol(["CLIENTE"]);

  return (
    <>
      <TituloPagina
        titulo="Mis Clases"
        descripcion="Consultá tus inscripciones activas y cancelá una reserva si lo necesitás."
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <TarjetaEstadistica titulo="Inscripciones activas" valor="3" icono="▣" />
        <TarjetaEstadistica titulo="En lista de espera" valor="1" icono="⏳" />
        <TarjetaEstadistica titulo="Asistencias del mes" valor="8" icono="✅" />
      </section>

      <PanelConstruccion
        titulo="Mis inscripciones"
        descripcion="Acá luego se mostrarán las clases en las que el cliente está inscripto."
      />
    </>
  );
}