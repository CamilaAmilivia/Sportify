import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { BotonPagarMercadoPago } from "@/components/pagos/BotonPagarMercadoPago";
import { PRECIO_ABONO_MENSUAL, TIPOS_PAGO } from "@/lib/pagos";

type ResumenInscripcionProps = {
  claseId: number;
};

async function obtenerClienteDePrueba() {
  return prisma.usuario.findUnique({
    where: {
      email: "cliente@sportify.com",
    },
  });
}

async function obtenerPenalizacionPendiente(usuarioId: number) {
  const usuario = await prisma.usuario.findUnique({
    where: {
      id: usuarioId,
    },
    select: {
      email: true,
    },
  });

  /**
   * MOCK TEMPORAL:
   * Sirve para probar visualmente la penalización.
   * Más adelante esto debería salir de una tabla real de penalizaciones.
   */
  if (usuario?.email === "cliente@sportify.com") {
    return {
      monto: 2500,
      motivo: "Penalización por inasistencia a una clase reservada",
    };
  }

  return null;
}

export async function ResumenInscripcion({ claseId }: ResumenInscripcionProps) {
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

  const cliente = await obtenerClienteDePrueba();

  if (!cliente) {
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

        <p>
          No se encontró el cliente de prueba. Corré el seed para crear{" "}
          <strong>cliente@sportify.com</strong>.
        </p>
      </>
    );
  }

  const penalizacion = await obtenerPenalizacionPendiente(cliente.id);

  const tipoPagoSeleccionado = TIPOS_PAGO.MENSUALIDAD;
  const montoBase = PRECIO_ABONO_MENSUAL;
  const montoPenalizacion = penalizacion?.monto ?? 0;
  const total = montoBase + montoPenalizacion;

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
          <div
            style={{
              border: "1px solid #22c55e",
              borderRadius: 12,
              padding: 20,
              background: "#f0fdf4",
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
          </div>

          <div
            style={{
              border: "1px solid #e5e7eb",
              borderRadius: 12,
              padding: 20,
              background: "white",
              opacity: 0.75,
            }}
          >
            <div style={{ fontSize: 28 }}>💲</div>

            <h3>Clase individual</h3>

            <p style={{ color: "#6b7280", fontSize: 14 }}>
              Pago único por esta clase.
            </p>

            <p style={{ fontWeight: 800, fontSize: 22 }}>
              ${clase.precio.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

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

        {penalizacion && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 10,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#b91c1c",
            }}
          >
            <strong>Penalización pendiente obligatoria</strong>

            <p style={{ marginTop: 6 }}>{penalizacion.motivo}</p>

            <p style={{ fontWeight: 800, marginTop: 6 }}>
              + ${penalizacion.monto.toLocaleString("es-AR")}
            </p>
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
            <span>Abono mensual</span>
            <strong>${montoBase.toLocaleString("es-AR")}</strong>
          </div>

          {penalizacion && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10,
                color: "#dc2626",
              }}
            >
              <span>Penalización obligatoria</span>

              <strong>+ ${montoPenalizacion.toLocaleString("es-AR")}</strong>
            </div>
          )}

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
            <span>${total.toLocaleString("es-AR")}</span>
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
          • El abono registra las clases semanales restantes del mes.
          <br />
          • Si alguna clase futura no tiene cupo, se genera lista de espera.
          <br />
          • La inscripción se confirma solamente si el pago es aprobado.
        </div>

        <div style={{ marginTop: 24 }}>
          <BotonPagarMercadoPago
            claseId={clase.id}
            usuarioId={cliente.id}
            tipoPago={tipoPagoSeleccionado}
            montoPenalizacion={montoPenalizacion}
          />
        </div>
      </section>
    </>
  );
}