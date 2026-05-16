import Link from "next/link";
import { requerirRol } from "@/lib/sesion";
import { prisma } from "@/lib/prisma";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { DetalleClase } from "./detalle-clase";
import { ResumenInscripcion } from "./resumen";

export const metadata = {
  title: "Cronograma — Sportify",
};

type PaginaCronogramaProps = {
  searchParams?: Promise<{
    claseId?: string;
    vista?: string;
  }>;
};

const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const horas = ["08:00", "09:00", "10:00", "17:00", "18:00", "19:00"];

function obtenerDiaSemana(fecha: Date) {
  const dia = fecha.getDay();

  const diasPorNumero: Record<number, string> = {
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
  };

  return diasPorNumero[dia];
}

function obtenerHora(fecha: Date) {
  return fecha.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export default async function PaginaCronograma({
  searchParams,
}: PaginaCronogramaProps) {
  await requerirRol(["CLIENTE"]);

  const parametros = searchParams ? await searchParams : {};
  const claseId = parametros.claseId ? Number(parametros.claseId) : null;
  const vista = parametros.vista;

  if (claseId && vista === "resumen") {
    return <ResumenInscripcion claseId={claseId} />;
  }

  if (claseId) {
    return <DetalleClase claseId={claseId} />;
  }

  const clases = await prisma.clase.findMany({
    where: {
      estado: "ACTIVA",
    },
    include: {
      disciplina: true,
      profesor: true,
      inscripciones: {
        where: {
          estado: "ACTIVA",
        },
      },
    },
    orderBy: {
      fechaHora: "asc",
    },
  });

  return (
    <>
      <TituloPagina
        titulo="Cronograma Semanal"
        descripcion="Consultá las clases disponibles e inscribite según cupo."
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 28,
          padding: 20,
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          background: "white",
        }}
      >
        <button
          type="button"
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            background: "#22c55e",
            color: "white",
            fontWeight: 700,
          }}
        >
          Todas
        </button>

        <button
          type="button"
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            background: "#f9fafb",
            fontWeight: 700,
          }}
        >
          🧘 Yoga
        </button>

        <button
          type="button"
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            background: "#f9fafb",
            fontWeight: 700,
          }}
        >
          🤸 Pilates
        </button>

        <button
          type="button"
          style={{
            border: "none",
            borderRadius: 12,
            padding: "12px 20px",
            background: "#f9fafb",
            fontWeight: 700,
          }}
        >
          💪 Funcional
        </button>
      </div>

      <section
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 14,
          background: "white",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "140px repeat(6, 1fr)",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <div style={{ padding: 20, color: "#6b7280" }}>Hora</div>

          {dias.map((dia) => (
            <div
              key={dia}
              style={{
                padding: 20,
                textAlign: "center",
                fontWeight: 600,
                borderLeft: "1px solid #e5e7eb",
              }}
            >
              {dia}
            </div>
          ))}
        </div>

        {horas.map((hora) => (
          <div
            key={hora}
            style={{
              display: "grid",
              gridTemplateColumns: "140px repeat(6, 1fr)",
              minHeight: 130,
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div style={{ padding: 20, color: "#6b7280" }}>{hora}</div>

            {dias.map((dia) => {
              const clase = clases.find((claseActual) => {
                const diaClase = obtenerDiaSemana(claseActual.fechaHora);
                const horaClase = obtenerHora(claseActual.fechaHora);

                return diaClase === dia && horaClase === hora;
              });

              if (!clase) {
                return (
                  <div
                    key={`${dia}-${hora}`}
                    style={{
                      borderLeft: "1px solid #e5e7eb",
                    }}
                  />
                );
              }

              const ocupados = clase.inscripciones.length;
              const disponibles = clase.cupoMaximo - ocupados;

              return (
                <div
                  key={`${dia}-${hora}`}
                  style={{
                    padding: 12,
                    borderLeft: "1px solid #e5e7eb",
                  }}
                >
                  <Link
                    href={`/plataforma/cronograma?claseId=${clase.id}`}
                    style={{
                      display: "block",
                      borderRadius: 12,
                      padding: 16,
                      background: "#dcfce7",
                      border: "1px solid #86efac",
                      color: "#166534",
                      textDecoration: "none",
                    }}
                  >
                    <strong>{clase.titulo}</strong>

                    <div style={{ fontSize: 14, marginTop: 8 }}>
                      {clase.profesor.nombre} {clase.profesor.apellido}
                    </div>

                    <div style={{ fontSize: 14, marginTop: 4 }}>
                      {disponibles}/{clase.cupoMaximo} cupos
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        ))}
      </section>
    </>
  );
}