import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Profesores — Sportify",
};

export default async function PaginaProfesores() {
  await requerirRol(["ADMIN"]);

  const profesores = await prisma.usuario.findMany({
    where: {
      rol: "PROFESOR",
    },
    orderBy: {
      nombre: "asc",
    },
  });

  return (
    <>
      <TituloPagina
        titulo="Gestión de profesores"
      />

      <div style={{ marginBottom: "40px" }}>
        <Link
          href="/plataforma/profesores/registrar"
          style={{
            display: "inline-block",
            padding: "16px 24px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            textDecoration: "none",
          }}
        >
          ➕ Registrar profesor
        </Link>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--color-dark)" }}>Lista de profesores</h2>
        <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", flex: 1 }}></div>
      </div>

      <div style={{ background: "white", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {profesores.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>No hay profesores registrados.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <tr>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Profesor</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>DNI</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Correo</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Fecha de nacimiento</th>
                </tr>
              </thead>
              <tbody>
                {profesores.map((profesor, index) => (
                  <tr key={profesor.id} style={{ borderBottom: index === profesores.length - 1 ? "none" : "1px solid rgba(0,0,0,0.06)" }}>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)" }}>
                      <div style={{ fontWeight: "700", fontSize: "1.05rem", marginBottom: "4px" }}>{profesor.nombre} {profesor.apellido}</div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)", fontWeight: 500 }}>
                      {profesor.dni}
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)", fontWeight: 500 }}>
                      {profesor.email}
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)", textTransform: "capitalize", fontWeight: 500 }}>
                      {profesor.fechaNac 
                        ? new Date(profesor.fechaNac).toLocaleDateString("es-AR", { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }) 
                        : "No especificada"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}