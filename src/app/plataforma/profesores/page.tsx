import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion";
import Link from "next/link";

export const metadata = {
  title: "Profesores — Sportify",
};

export default async function PaginaProfesores() {
  await requerirRol(["ADMIN"]);

  return (
    <>
      <TituloPagina
        titulo="Gestión de profesores"
      />

      <div
        style={{
          marginBottom: 32,
        }}
      >
        <Link
          href="/plataforma/profesores/registrar"
          style={{
            display: "inline-block",
            padding: "20px 24px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 20,
            textDecoration: "none",
          }}
        >
          ➕ Registrar profesor
        </Link>
      </div>

      <PanelConstruccion
        titulo="Listado de profesores"
        descripcion="Acá luego se mostrará una tabla con los usuarios que tengan rol PROFESOR."
      />
    </>
  );
}