import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { FormularioRegistroProfesor } from "@/components/admin/FormularioRegistroProfesor";

export const metadata = {
  title: "Registrar Profesor — Sportify",
};

export default async function PaginaRegistrarProfesor() {
  await requerirRol(["ADMIN"]);

  return (
    <>
      <TituloPagina
        titulo="Gestión de Profesores"
        descripcion="Desde acá el administrador va a poder registrar profesores y asignarlos a clases."
      />

      <div style={{ marginTop: "32px", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "1.25rem", marginBottom: "16px", color: "var(--color-texto)" }}>
          Registrar nuevo profesor
        </h2>
        <FormularioRegistroProfesor />
      </div>
    </>
  );
}
