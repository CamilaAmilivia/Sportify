import { requerirRol } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { TarjetaAccion } from "@/components/ui/TarjetaAccion";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const metadata = {
  title: "Asistencia — Sportify",
};

export default async function PaginaAsistencia() {
  const usuario = await requerirRol(["ADMIN", "PROFESOR"]);

  // Obtener fecha actual sin horas para filtrar las clases de "hoy"
  const hoyInicio = new Date();
  hoyInicio.setHours(0, 0, 0, 0);
  const hoyFin = new Date();
  hoyFin.setHours(23, 59, 59, 999);

  let clasesDeHoy: any[] = [];

  if (usuario.rol === "PROFESOR") {
    clasesDeHoy = await prisma.clase.findMany({
      where: {
        profesorId: usuario.id,
        estado: "ACTIVA",
        fechaHora: {
          gte: hoyInicio,
          lte: hoyFin,
        },
      },
      include: {
        disciplina: true,
      },
      orderBy: {
        fechaHora: "asc",
      },
    });
  }

  const ahora = new Date();

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
        {usuario.rol === "ADMIN" && (
          <TarjetaAccion
            titulo="Ver asistencia general"
            descripcion="Consultar asistencia por clase, profesor o fecha."
            href="#"
            icono="▤"
          />
        )}
      </div>

      {usuario.rol === "PROFESOR" && (
        <section
          style={{
            background: "white",
            padding: 24,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 16 }}>Mis clases de hoy</h2>

          {clasesDeHoy.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No tenés clases asignadas para el día de hoy.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {clasesDeHoy.map((clase) => {
                const horaInicio = clase.fechaHora.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                const inicioVentana = new Date(clase.fechaHora.getTime() - 10 * 60000);
                const finVentana = new Date(clase.fechaHora.getTime() + (clase.duracionMin + 30) * 60000);
                const puedeGenerarQR = ahora >= inicioVentana && ahora <= finVentana;

                return (
                  <div
                    key={clase.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: 16,
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                      background: "#f9fafb",
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: 18, marginBottom: 4 }}>
                        {clase.titulo} - {clase.disciplina.nombre}
                      </h3>
                      <div style={{ color: "#6b7280", fontSize: 14 }}>
                        🕒 {horaInicio} ({clase.duracionMin} min)
                      </div>
                    </div>

                    {puedeGenerarQR ? (
                      <Link
                        href={`/plataforma/asistencia/${clase.id}`}
                        style={{
                          background: "#22c55e",
                          color: "white",
                          padding: "10px 16px",
                          borderRadius: 8,
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        Generar QR
                      </Link>
                    ) : (
                      <button
                        disabled
                        style={{
                          background: "#e5e7eb",
                          color: "#9ca3af",
                          border: "none",
                          padding: "10px 16px",
                          borderRadius: 8,
                          fontWeight: 600,
                          cursor: "not-allowed",
                        }}
                        title="Solo se puede generar QR desde 10 min antes hasta finalizar la clase"
                      >
                        Generar QR
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </>
  );
}