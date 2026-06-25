import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requerirUsuarioActual } from "@/lib/sesion";
import { BotonListaEspera } from "./BotonListaEspera";
import { BotonUsarCredito } from "./BotonUsarCredito";
import { obtenerCuposDisponiblesPublico } from "@/lib/listaEspera";
import { obtenerCreditosDisponibles } from "@/lib/creditos";

type DetalleClaseProps = {
  claseId: number;
};

export async function DetalleClase({ claseId }: DetalleClaseProps) {
  const usuario = await requerirUsuarioActual();

  const clase = await prisma.clase.findUnique({
    where: {
      id: claseId,
    },
    include: {
      disciplina: true,
      profesor: true,
      inscripciones: {
        where: {
          estado: "ACTIVA",
        },
      },
      listaEspera: {
        where: {
          usuarioId: usuario.id,
        },
      },
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

  const ocupados = clase.inscripciones.length;

  const reservasPendientes = await prisma.pago.count({
    where: { claseId: clase.id, estado: "PENDIENTE", reservaHasta: { gt: new Date() } },
  });

  const librestotal = clase.cupoMaximo - ocupados - reservasPendientes;

  const disponibles = await obtenerCuposDisponiblesPublico(clase.id);

  const miEntradaListaEspera = clase.listaEspera[0] ?? null;
  const elegibleAhora =
    !!miEntradaListaEspera && miEntradaListaEspera.posicion <= librestotal && librestotal > 0;

  const sinCupo = elegibleAhora ? false : disponibles <= 0;
  const yaEnListaEspera = !!miEntradaListaEspera && !elegibleAhora;

  const creditosDisponibles =
    usuario.rol === "CLIENTE" ? await obtenerCreditosDisponibles(usuario.id) : 0;

  return (
    <>
      <Link
        href="/plataforma/cronograma"
        style={{
          display: "inline-block",
          marginBottom: 32,
          color: "#16a34a",
          fontWeight: 700,
          textDecoration: "none",
        }}
      >
        ← Volver al cronograma
      </Link>

      <section
        style={{
          maxWidth: 1040,
          border: "1px solid #e5e7eb",
          borderRadius: 16,
          padding: 32,
          background: "white",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontSize: 30, marginBottom: 10 }}>{clase.titulo}</h1>

            <p style={{ color: "#6b7280" }}>
              {clase.profesor.nombre} {clase.profesor.apellido}
            </p>
          </div>

          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: 14,
              background: "#22c55e",
              color: "white",
              display: "grid",
              placeItems: "center",
              fontSize: 32,
            }}
          >
            🧘
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: 32,
            marginTop: 36,
          }}
        >
          <p>
            <strong>Fecha</strong>
            <br />
            {clase.fechaHora.toLocaleDateString("es-AR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>

          <p>
            <strong>Horario</strong>
            <br />
            {clase.fechaHora.toLocaleTimeString("es-AR", {
              hour: "2-digit",
              minute: "2-digit",
            })}{" "}
            ({clase.duracionMin} min)
          </p>

          <p>
            <strong>Cupos</strong>
            <br />
            {ocupados}/{clase.cupoMaximo} ocupados{" "}
            <span style={{ color: sinCupo ? "#dc2626" : "#16a34a" }}>
              ({disponibles} disponibles)
            </span>
          </p>

          <p>
            <strong>Profesor</strong>
            <br />
            {clase.profesor.nombre} {clase.profesor.apellido}
          </p>

          <p>
            <strong>Precio clase individual</strong>
            <br />${clase.precio.toLocaleString("es-AR")}
          </p>
        </div>

        <div style={{ marginTop: 32 }}>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Descripción</h2>

          <p style={{ color: "#6b7280" }}>
            {clase.descripcion ?? "Sin descripción cargada."}
          </p>
        </div>

        <div style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: 22, marginBottom: 10 }}>Disciplina</h2>

          <p style={{ color: "#6b7280" }}>{clase.disciplina.nombre}</p>
        </div>

        <div
          style={{
            marginTop: 32,
            padding: 20,
            borderRadius: 12,
            background: sinCupo ? "#fef2f2" : "#f0fdf4",
            border: sinCupo ? "1px solid #fecaca" : "1px solid #bbf7d0",
            color: sinCupo ? "#b91c1c" : "#166534",
          }}
        >
          {sinCupo
            ? "No hay cupos disponibles"
            : elegibleAhora
              ? "✓ Tenés un cupo reservado por tu lugar en la lista de espera"
              : `✓ Hay ${disponibles} cupos disponibles`}
        </div>

        {usuario.rol === "CLIENTE" && (
          <Link
            href={`/plataforma/cronograma?claseId=${clase.id}&vista=resumen&tipoPago=CLASE_INDIVIDUAL`}
            style={{
              display: "block",
              textAlign: "center",
              marginTop: 24,
              borderRadius: 10,
              padding: "14px 16px",
              background: sinCupo ? "#9ca3af" : "#22c55e",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
              pointerEvents: sinCupo ? "none" : "auto",
            }}
          >
            Inscribirme
          </Link>
        )}

        {usuario.rol === "CLIENTE" && !sinCupo && creditosDisponibles > 0 && (
          <BotonUsarCredito claseId={clase.id} creditosDisponibles={creditosDisponibles} />
        )}

        {usuario.rol === "CLIENTE" && sinCupo && !yaEnListaEspera && (
          <BotonListaEspera claseId={clase.id} />
        )}

        {usuario.rol === "CLIENTE" && sinCupo && yaEnListaEspera && (
          <div
            style={{
              marginTop: 24,
              textAlign: "center",
              borderRadius: 10,
              padding: "14px 16px",
              background: "#fef9c3",
              color: "#854d0e",
              fontWeight: 700,
            }}
          >
            ✓ Ya estás en la lista de espera (posición {clase.listaEspera[0].posicion})
          </div>
        )}
      </section>
    </>
  );
}