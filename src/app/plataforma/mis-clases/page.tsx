import { requerirUsuarioActual } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { TarjetaEstadistica } from "@/components/ui/TarjetaEstadistica";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BotonAsistencia } from "./BotonAsistencia";

export const metadata = {
  title: "Mis clases — Sportify",
};

export default async function PaginaMisClases() {
  const usuario = await requerirUsuarioActual();

  if (usuario.rol === "ADMIN") {
    redirect("/plataforma");
  }

  const ahora = new Date();
  
  // Margen de 2 horas para considerar una clase como "activa/próxima" aunque haya empezado hace un ratito.
  const limiteInferior = new Date(ahora);
  limiteInferior.setHours(limiteInferior.getHours() - 2);
  if (usuario.rol === "CLIENTE") {
    const sieteDias = new Date(ahora);
    sieteDias.setDate(sieteDias.getDate() + 7);

    const treintaDiasAtras = new Date(ahora);
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const inscripcionesActivas = await prisma.inscripcion.count({
      where: {
        usuarioId: usuario.id,
        estado: "ACTIVA",
        clase: { fechaHora: { gt: limiteInferior }, estado: "ACTIVA" },
      },
    });

    const enListaEspera = await prisma.listaEspera.count({
      where: {
        usuarioId: usuario.id,
        clase: { fechaHora: { gt: limiteInferior }, estado: "ACTIVA" },
      },
    });

    const proximaConfirmada = await prisma.inscripcion.findFirst({
      where: {
        usuarioId: usuario.id,
        estado: "ACTIVA",
        clase: { fechaHora: { gt: limiteInferior }, estado: "ACTIVA" },
      },
      orderBy: { clase: { fechaHora: "asc" } },
      include: { clase: true },
    });

    // Ausencias en últimos 30 días
    const ausencias = await prisma.clase.count({
      where: {
        fechaHora: { gte: treintaDiasAtras, lt: limiteInferior },
        inscripciones: {
          some: {
            usuarioId: usuario.id,
            estado: "ACTIVA",
          },
        },
        NOT: {
          asistencias: {
            some: {
              usuarioId: usuario.id,
              presente: true,
            },
          },
        },
      },
    });

    const proximas7Dias = await prisma.inscripcion.findMany({
      where: {
        usuarioId: usuario.id,
        estado: "ACTIVA",
        clase: { fechaHora: { gt: limiteInferior, lte: sieteDias }, estado: "ACTIVA" },
      },
      orderBy: { clase: { fechaHora: "asc" } },
      include: { clase: { include: { disciplina: true } } },
    });

    const pendientes = await prisma.listaEspera.findMany({
      where: {
        usuarioId: usuario.id,
        clase: { fechaHora: { gt: limiteInferior }, estado: "ACTIVA" },
      },
      orderBy: { clase: { fechaHora: "asc" } },
      include: { clase: { include: { disciplina: true } } },
    });

    const fechaProxima = proximaConfirmada
      ? format(proximaConfirmada.clase.fechaHora, "dd/MM HH:mm", { locale: es })
      : "-";

    return (
      <>
        <TituloPagina
          titulo="Mis clases"
          descripcion="Consultá tus inscripciones activas y tu agenda de los próximos días."
        />

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
            marginBottom: 32,
          }}
        >
          <TarjetaEstadistica
            titulo="Inscripciones activas"
            valor={String(inscripcionesActivas)}
            icono="▣"
          />
          <TarjetaEstadistica
            titulo="En lista de espera"
            valor={String(enListaEspera)}
            icono="⏳"
          />
          <TarjetaEstadistica
            titulo="Próxima clase"
            valor={fechaProxima}
            icono="🗓️"
          />
          <TarjetaEstadistica
            titulo="Ausencias (30 días)"
            valor={String(ausencias)}
            icono="⚠️"
          />
        </section>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 32,
          }}
        >
          {/* Columna Confirmadas */}
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ✅ Confirmadas (próx. 7 días)
            </h2>
            {proximas7Dias.length === 0 ? (
              <p
                style={{
                  color: "var(--color-gray)",
                  background: "white",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                  textAlign: "center",
                }}
              >
                No tenés clases confirmadas en los próximos 7 días.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {proximas7Dias.map((insc) => (
                  <ClaseListItem
                    key={insc.id}
                    titulo={insc.clase.disciplina.nombre}
                    fechaHora={insc.clase.fechaHora}
                    estado="Confirmada"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Columna Pendientes */}
          <div>
            <h2
              style={{
                fontSize: "1.25rem",
                marginBottom: 16,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              ⏳ En lista de espera
            </h2>
            {pendientes.length === 0 ? (
              <p
                style={{
                  color: "var(--color-gray)",
                  background: "white",
                  padding: 24,
                  borderRadius: 12,
                  border: "1px solid rgba(0,0,0,0.08)",
                  textAlign: "center",
                }}
              >
                No estás en lista de espera para ninguna clase.
              </p>
            ) : (
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {pendientes.map((espera) => (
                  <ClaseListItem
                    key={espera.id}
                    titulo={espera.clase.disciplina.nombre}
                    fechaHora={espera.clase.fechaHora}
                    estado={`Posición ${espera.posicion}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  if (usuario.rol === "PROFESOR") {
    const hoyInicio = new Date(ahora);
    hoyInicio.setHours(0, 0, 0, 0);

    const sieteDiasAdelante = new Date(ahora);
    sieteDiasAdelante.setDate(sieteDiasAdelante.getDate() + 7);
    sieteDiasAdelante.setHours(23, 59, 59, 999);

    const proximas = await prisma.clase.findMany({
      where: {
        profesorId: usuario.id,
        fechaHora: { gte: hoyInicio, lte: sieteDiasAdelante },
        estado: "ACTIVA",
      },
      orderBy: { fechaHora: "asc" },
      include: {
        disciplina: true,
        _count: {
          select: { inscripciones: { where: { estado: "ACTIVA" } } },
        },
      },
    });

    return (
      <>
        <TituloPagina
          titulo="Mis clases"
          descripcion="Revisá tu agenda y tomá asistencia de tus clases."
        />

        <div style={{ marginTop: 24 }}>
          {proximas.length === 0 ? (
            <p
              style={{
                color: "var(--color-gray)",
                background: "white",
                padding: 24,
                borderRadius: 12,
                border: "1px solid rgba(0,0,0,0.08)",
                textAlign: "center",
              }}
            >
              No tenés clases asignadas próximamente.
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {proximas.map((clase) => {
                const inicioVentana = new Date(
                  clase.fechaHora.getTime() - 10 * 60000
                );
                const finVentana = new Date(
                  clase.fechaHora.getTime() + (clase.duracionMin + 30) * 60000
                );

                return (
                  <div
                    key={clase.id}
                    style={{
                      background: "white",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 12,
                      padding: "16px 20px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3 style={{ margin: "0 0 4px", fontSize: "1.1rem" }}>
                        {clase.disciplina.nombre}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          color: "var(--color-gray)",
                          fontSize: "0.9rem",
                          textTransform: "capitalize",
                          marginBottom: 8,
                        }}
                      >
                        {format(clase.fechaHora, "EEEE d 'de' MMMM, HH:mm", {
                          locale: es,
                        })}{" "}
                        hs
                      </p>
                      <span
                        style={{
                          background: "rgba(34, 197, 94, 0.1)",
                          color: "#16a34a",
                          padding: "4px 12px",
                          borderRadius: 20,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {clase._count.inscripciones} inscriptos
                      </span>
                    </div>
                    <div
                      style={{
                        textAlign: "right",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <BotonAsistencia
                        claseId={clase.id}
                        inicioVentana={inicioVentana.toISOString()}
                        finVentana={finVentana.toISOString()}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </>
    );
  }

  return null;
}

function ClaseListItem({
  titulo,
  fechaHora,
  estado,
}: {
  titulo: string;
  fechaHora: Date;
  estado: string;
}) {
  return (
    <div
      style={{
        background: "white",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 12,
        padding: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      <div>
        <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem" }}>{titulo}</h4>
        <p
          style={{
            margin: 0,
            color: "var(--color-gray)",
            fontSize: "0.85rem",
            textTransform: "capitalize",
          }}
        >
          {format(fechaHora, "EEEE d, HH:mm", { locale: es })} hs
        </p>
      </div>
      <div
        style={{
          background:
            estado === "Confirmada"
              ? "rgba(34, 197, 94, 0.1)"
              : "rgba(234, 179, 8, 0.1)",
          color: estado === "Confirmada" ? "#16a34a" : "#ca8a04",
          padding: "4px 10px",
          borderRadius: 8,
          fontSize: "0.8rem",
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {estado}
      </div>
    </div>
  );
}