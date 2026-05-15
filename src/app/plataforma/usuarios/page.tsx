import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion";
import { TarjetaEstadistica } from "@/components/ui/TarjetaEstadistica";

export const metadata = {
  title: "Usuarios — Sportify",
};

export default async function PaginaUsuarios() {
  await requerirRol(["ADMIN"]);

  return (
    <>
      <TituloPagina
        titulo="Gestión de Usuarios"
        descripcion="Desde acá el administrador va a poder consultar clientes registrados."
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <TarjetaEstadistica titulo="Clientes" valor="128" icono="👤" />
        <TarjetaEstadistica titulo="Profesores" valor="12" icono="🧑‍🏫" />
      </section>

      <PanelConstruccion
        titulo="Listado de usuarios"
        descripcion="Acá luego se mostrará una tabla con usuarios reales desde Prisma."
      />
    </>
  );
}