import Link from "next/link";
import { prisma } from "@/lib/prisma";

type PaginaResultadoPagoProps = {
  searchParams?: Promise<{
    resultado?: string;
    status?: string;
    collection_status?: string;
    pagoId?: string;
  }>;
};

export default async function PaginaResultadoPago({
  searchParams,
}: PaginaResultadoPagoProps) {
  const params = searchParams ? await searchParams : {};

  const resultado = params.resultado;
  const estadoMercadoPago = params.status ?? params.collection_status;
  const pagoId = Number(params.pagoId);

  const aprobado =
    resultado === "success" || estadoMercadoPago === "approved";

  const rechazado =
    resultado === "failure" ||
    estadoMercadoPago === "rejected" ||
    estadoMercadoPago === "failure";

  const pendiente =
    resultado === "pending" || estadoMercadoPago === "pending";

  const clasesEnListaEspera =
    aprobado && Number.isFinite(pagoId)
      ? await prisma.listaEspera.findMany({
          where: {
            pagoId,
            tipo: "ABONADO",
          },
          include: {
            clase: {
              include: {
                disciplina: true,
              },
            },
          },
          orderBy: {
            clase: {
              fechaHora: "asc",
            },
          },
        })
      : [];

  return (
    <section
      style={{
        maxWidth: 720,
        margin: "0 auto",
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 32,
        background: "white",
      }}
    >
      {aprobado && (
        <>
          <h1 style={{ color: "#16a34a", marginBottom: 12 }}>
            Inscripción exitosa
          </h1>

          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            El pago fue aprobado. Tu inscripción fue procesada correctamente.
            Si elegiste abono mensual, se registraron las clases semanales
            restantes del mes.
          </p>

          {clasesEnListaEspera.length > 0 && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 10,
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                color: "#1d4ed8",
              }}
            >
              <strong>
                Quedaste en lista de espera con prioridad de abonado para:
              </strong>

              <ul style={{ marginTop: 10, paddingLeft: 20 }}>
                {clasesEnListaEspera.map((item) => (
                  <li key={item.id}>
                    {item.clase.disciplina.nombre} - {item.clase.titulo} -{" "}
                    {item.clase.fechaHora.toLocaleDateString("es-AR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    a las{" "}
                    {item.clase.fechaHora.toLocaleTimeString("es-AR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      {rechazado && (
        <>
          <h1 style={{ color: "#dc2626", marginBottom: 12 }}>
            Inscripción rechazada
          </h1>

          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            Inscripción rechazada por problemas en el pago, inténtelo más
            tarde.
          </p>
        </>
      )}

      {pendiente && (
        <>
          <h1 style={{ color: "#92400e", marginBottom: 12 }}>
            Pago pendiente
          </h1>

          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            El pago todavía se está procesando. Revisá tus inscripciones en
            unos minutos.
          </p>
        </>
      )}

      {!aprobado && !rechazado && !pendiente && (
        <>
          <h1 style={{ marginBottom: 12 }}>Resultado del pago</h1>

          <p style={{ color: "#374151", lineHeight: 1.6 }}>
            No pudimos identificar el resultado del pago. Revisá tus
            inscripciones o volvé al cronograma.
          </p>
        </>
      )}

      <Link
        href="/plataforma/cronograma"
        style={{
          display: "inline-block",
          marginTop: 24,
          color: "#16a34a",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        Volver al cronograma
      </Link>
    </section>
  );
}