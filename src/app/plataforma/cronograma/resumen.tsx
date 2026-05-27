import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requerirUsuarioActual } from "@/lib/sesion";
import { BotonPagarMercadoPago } from "@/components/pagos/BotonPagarMercadoPago";
import {
  PRECIO_ABONO_MENSUAL,
  TIPOS_PAGO,
  normalizarTipoPago,
  type TipoPagoSportify,
} from "@/lib/pagos";

type ResumenInscripcionProps = {
  claseId: number;
  tipoPago?: string;
};

export async function ResumenInscripcion({
  claseId,
  tipoPago,
}: ResumenInscripcionProps) {
  const usuario = await requerirUsuarioActual();

  const clase = await prisma.clase.findUnique({
    where: {
      id: claseId,
    },
    include: {
      disciplina: true,
      profesor: true,
    },
  });

  if (!clase) {
    return (
      <>
        <Link
          href="/plataforma/cronograma"
          style={{
            display: "inline-block",
            marginBottom: 24,
            color: "#16a34a",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          ← Volver al cronograma
        </Link>

        <p>No se encontró la clase seleccionada.</p>
      </>
    );
  }

  const tipoPagoSeleccionado: TipoPagoSportify = normalizarTipoPago(
    tipoPago ?? TIPOS_PAGO.CLASE_INDIVIDUAL
  );

  const esAbono = tipoPagoSeleccionado === TIPOS_PAGO.MENSUALIDAD;
  const esClaseIndividual =
    tipoPagoSeleccionado === TIPOS_PAGO.CLASE_INDIVIDUAL;

  const montoClaseIndividual = Number(clase.precio);

  const montoTotal = esAbono
    ? PRECIO_ABONO_MENSUAL
    : montoClaseIndividual;

  return (
    <>
      <Link
        href={`/plataforma/cronograma?claseId=${clase.id}`}
        style={{
          display: "inline-block",
          marginBottom: 24,
          color: "#16a34a",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        ← Volver a la clase
      </Link>

      <section
        style={{
          maxWidth: 720,
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 28,
          background: "white",
        }}
      >
        <h1 style={{ fontSize: 28, marginBottom: 8 }}>Inscripción</h1>

        <p style={{ color: "#6b7280" }}>
          Completá tu inscripción para {clase.titulo}
        </p>

        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 10,
            background: "#f9fafb",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 20,
          }}
        >
          <p>
            <strong>Día</strong>
            <br />
            {clase.fechaHora.toLocaleDateString("es-AR", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <p>
            <strong>Hora</strong>
            <br />
            {clase.fechaHora.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <h2 style={{ marginTop: 28, fontSize: 18 }}>Tipo de inscripción</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 12,
          }}
        >
          <Link
            href={`/plataforma/cronograma?claseId=${clase.id}&vista=resumen&tipoPago=${TIPOS_PAGO.MENSUALIDAD}`}
            style={{
              border: esAbono ? "1px solid #22c55e" : "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              background: esAbono ? "#f0fdf4" : "white",
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <div style={{ fontSize: 28 }}>📅</div>

            <h3>Abono mensual</h3>

            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Horario fijo semanal con beneficios exclusivos.
            </p>

            <p style={{ color: "#16a34a", fontWeight: 800, fontSize: 22 }}>
              ${PRECIO_ABONO_MENSUAL.toLocaleString("es-AR")}/mes
            </p>
          </Link>

          <Link
            href={`/plataforma/cronograma?claseId=${clase.id}&vista=resumen&tipoPago=${TIPOS_PAGO.CLASE_INDIVIDUAL}`}
            style={{
              border: esClaseIndividual
                ? "1px solid #22c55e"
                : "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              background: esClaseIndividual ? "#f0fdf4" : "white",
              textDecoration: "none",
              color: "inherit",
              display: "block",
            }}
          >
            <div style={{ fontSize: 28 }}>💲</div>

            <h3>Clase individual</h3>

            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Pago único por esta clase.
            </p>

            <p style={{ fontWeight: 800, fontSize: 22 }}>
              ${montoClaseIndividual.toLocaleString("es-AR")}
            </p>
          </Link>
        </div>

        {esAbono && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#166534",
            }}
          >
            <strong>Beneficios del abono</strong>
            <br />
            ✓ Horario fijo garantizado cada semana
            <br />
            ✓ Prioridad en lista de espera
            <br />
            ✓ Créditos por clases perdidas
            <br />✓ Precio más económico que clases individuales
          </div>
        )}

        <h2 style={{ marginTop: 28, fontSize: 18 }}>Resumen de pago</h2>

        <div
          style={{
            marginTop: 12,
            borderRadius: 10,
            background: "#f9fafb",
            padding: 16,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>{esAbono ? "Abono mensual" : "Clase individual"}</span>

            <strong>${montoTotal.toLocaleString("es-AR")}</strong>
          </div>

          <hr style={{ margin: "14px 0", borderColor: "#e5e7eb" }} />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              color: "#16a34a",
              fontWeight: 800,
            }}
          >
            <span>Total a pagar ahora</span>
            <span>${montoTotal.toLocaleString("es-AR")}</span>
          </div>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 10,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            fontSize: 14,
          }}
        >
          <strong>ⓘ Información importante</strong>
          <br />

          {esAbono ? (
            <>
              • El abono registra las clases semanales restantes del mes.
              <br />
              • Si alguna clase futura no tiene cupo, se genera lista de espera.
              <br />
              • La inscripción se confirma solamente si el pago es aprobado.
            </>
          ) : (
            <>
              • La inscripción corresponde únicamente a esta clase.
              <br />
              • La inscripción se confirma solamente si el pago es aprobado.
              <br />
              • Si ya estás inscripta, el sistema no permitirá repetir la
              inscripción.
            </>
          )}
        </div>

        <div style={{ marginTop: 24 }}>
          <BotonPagarMercadoPago
            claseId={clase.id}
            usuarioId={usuario.id}
            tipoPago={tipoPagoSeleccionado}
          />
        </div>
      </section>
    </>
  );
}