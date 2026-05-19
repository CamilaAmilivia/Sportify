import Link from "next/link";

type PaginaResultadoPagoProps = {
  searchParams?: Promise<{
    resultado?: string;
    status?: string;
    collection_status?: string;
  }>;
};

export default async function PaginaResultadoPago({
  searchParams,
}: PaginaResultadoPagoProps) {
  const params = searchParams ? await searchParams : {};

  const resultado = params.resultado;
  const estadoMercadoPago = params.status ?? params.collection_status;

  const aprobado =
    resultado === "success" || estadoMercadoPago === "approved";

  const rechazado =
    resultado === "failure" ||
    estadoMercadoPago === "rejected" ||
    estadoMercadoPago === "failure";

  const pendiente =
    resultado === "pending" || estadoMercadoPago === "pending";

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
            restantes del mes. Si alguna no tenía cupo, quedaste en lista de
            espera.
          </p>
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