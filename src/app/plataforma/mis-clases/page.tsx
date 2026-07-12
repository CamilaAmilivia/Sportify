import Link from "next/link";
import { requerirUsuarioActual } from "@/lib/sesion";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { TarjetaEstadistica } from "@/components/ui/TarjetaEstadistica";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { BotonAsistencia } from "./BotonAsistencia";
import { BotonEscanearCliente } from "./BotonEscanearCliente";
import { BotonCancelarInscripcion } from "./BotonCancelarInscripcion";
import { BotonCancelarListaEspera } from "./BotonCancelarListaEspera";
import { obtenerCreditosDisponibles } from "@/lib/creditos";
import { aplicarPenalizacionPorAusencia } from "@/lib/penalizaciones";
import { notificarElegiblesListaEspera } from "@/lib/listaEspera";

export const metadata = {
  title: "Mis clases — Sportify",
};

type PaginaMisClasesProps = {
  searchParams: Promise<{ dias?: string; diasEspera?: string }>;
};

export default async function PaginaMisClases({
  searchParams,
}: PaginaMisClasesProps) {
  const usuario = await requerirUsuarioActual();
  const { dias, diasEspera } = await searchParams;
  const rangoDias = Math.max(7, Number(dias) || 7);
  const rangoEspera = Math.max(7, Number(diasEspera) || 7);

  if (usuario.rol === "ADMIN") {
    redirect("/plataforma");
  }

  const ahora = new Date();
  
  // Margen de 2 horas para considerar una clase como "activa/próxima" aunque haya empezado hace un ratito.
  const limiteInferior = new Date(ahora);
  limiteInferior.setHours(limiteInferior.getHours() - 2);
  if (usuario.rol === "CLIENTE") {
    const finRango = new Date(ahora);
    finRango.setDate(finRango.getDate() + rangoDias);

    const treintaDiasAtras = new Date(ahora);
    treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

    const proximaConfirmada = await prisma.inscripcion.findFirst({
      where: {
        usuarioId: usuario.id,
        estado: "ACTIVA",
        clase: { fechaHora: { gt: limiteInferior }, estado: "ACTIVA" },
      },
      orderBy: { clase: { fechaHora: "asc" } },
      include: { clase: { include: { disciplina: true } } },
    });

    // Ausencias en últimos 30 días (solo donde el profesor marcó presente: false)
    const asistenciasAusente = await prisma.asistencia.findMany({
      where: {
        usuarioId: usuario.id,
        presente: false,
        clase: { fechaHora: { gte: treintaDiasAtras, lt: limiteInferior } },
      },
      include: { clase: { include: { inscripciones: { where: { usuarioId: usuario.id } } } } },
    });

    // Aplicar penalizaciones por ausencia (idempotente)
    await Promise.all(
      asistenciasAusente
        .flatMap((a) => a.clase.inscripciones)
        .map((insc) => aplicarPenalizacionPorAusencia(insc.id))
    );

    const ausenciasIndividual = await prisma.penalizacion.count({
      where: { usuarioId: usuario.id, tipo: "RECARGO_AUSENCIA_INDIVIDUAL", createdAt: { gte: treintaDiasAtras } },
    });

    const ausenciasAbono = await prisma.penalizacion.count({
      where: { usuarioId: usuario.id, tipo: "AVISO_AUSENCIA_ABONO", createdAt: { gte: treintaDiasAtras } },
    });

    const ultimoRecargoIndividual = await prisma.penalizacion.findFirst({
      where: { usuarioId: usuario.id, tipo: "RECARGO_CLASE_INDIVIDUAL" },
      orderBy: { createdAt: "desc" },
    });

    const avisosIndividualCicloActual = await prisma.penalizacion.count({
      where: {
        usuarioId: usuario.id,
        tipo: "AVISO_CANCELACION_TARDIA_INDIVIDUAL",
        createdAt: { gt: ultimoRecargoIndividual?.createdAt ?? new Date(0) },
      },
    });

    const recargoIndividualPendiente = await prisma.penalizacion.count({
      where: {
        usuarioId: usuario.id,
        tipo: { in: ["RECARGO_CLASE_INDIVIDUAL", "RECARGO_AUSENCIA_INDIVIDUAL"] },
        aplicada: false,
      },
    });

    const cancelacionesIndividual = recargoIndividualPendiente > 0 ? recargoIndividualPendiente : avisosIndividualCicloActual;

    const ultimoRecargoAbono = await prisma.penalizacion.findFirst({
      where: { usuarioId: usuario.id, tipo: "RECARGO_ABONO" },
      orderBy: { createdAt: "desc" },
    });

    const avisosAbonoCicloActual = await prisma.penalizacion.count({
      where: {
        usuarioId: usuario.id,
        tipo: "AVISO_CANCELACION_TARDIA_ABONO",
        createdAt: { gt: ultimoRecargoAbono?.createdAt ?? new Date(0) },
      },
    });

    const recargoAbonoPendiente = await prisma.penalizacion.count({
      where: { usuarioId: usuario.id, tipo: "RECARGO_ABONO", aplicada: false },
    });

    const cancelacionesAbono = recargoAbonoPendiente > 0 ? recargoAbonoPendiente : avisosAbonoCicloActual;

    const hoyInicio = new Date(ahora);
    hoyInicio.setHours(0, 0, 0, 0);

    const proximasClases = await prisma.inscripcion.findMany({
      where: {
        usuarioId: usuario.id,
        estado: "ACTIVA",
        clase: { fechaHora: { gte: hoyInicio, lte: finRango }, estado: "ACTIVA" },
      },
      orderBy: { clase: { fechaHora: "asc" } },
      include: {
        clase: {
          include: {
            disciplina: true,
            asistencias: {
              where: {
                usuarioId: usuario.id,
              },
            },
          },
        },
        pago: { select: { tipo: true } },
      },
    });

    const finRangoEspera = new Date(ahora);
    finRangoEspera.setDate(finRangoEspera.getDate() + rangoEspera);

    const pendientes = await prisma.listaEspera.findMany({
      where: {
        usuarioId: usuario.id,
        clase: { fechaHora: { gt: limiteInferior, lte: finRangoEspera }, estado: "ACTIVA" },
      },
      orderBy: { clase: { fechaHora: "asc" } },
      include: { clase: { include: { disciplina: true } } },
    });

    // Auto-notificar elegibles por si la notificación no se envió antes (idempotente)
    await Promise.all(pendientes.map((e) => notificarElegiblesListaEspera(e.claseId)));

    // Re-fetchear para obtener notificadoEn actualizado
    const pendientesActualizados = await prisma.listaEspera.findMany({
      where: {
        usuarioId: usuario.id,
        clase: { fechaHora: { gt: limiteInferior, lte: finRangoEspera }, estado: "ACTIVA" },
      },
      orderBy: { clase: { fechaHora: "asc" } },
      include: { clase: { include: { disciplina: true } } },
    });

    const hayMasEspera = await prisma.listaEspera.count({
      where: {
        usuarioId: usuario.id,
        clase: { fechaHora: { gt: finRangoEspera }, estado: "ACTIVA" },
      },
    }) > 0;

    const hayMasClases = await prisma.inscripcion.count({
      where: {
        usuarioId: usuario.id,
        estado: "ACTIVA",
        clase: { fechaHora: { gt: finRango }, estado: "ACTIVA" },
      },
    }) > 0;

    const ventanaNotificacion = new Date(ahora.getTime() - 24 * 60 * 60 * 1000);

    const fechaProxima = proximaConfirmada
      ? format(proximaConfirmada.clase.fechaHora, "dd/MM HH:mm", { locale: es })
      : "-";

    const creditosDisponibles = await obtenerCreditosDisponibles(usuario.id);

    return (
      <>
        <TituloPagina
          titulo="Mis clases"
          descripcion="Consultá tus inscripciones activas y tu agenda de los próximos días."
        />

        {/* Banner próxima clase */}
        {proximaConfirmada && (
          <div style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 16,
            padding: "20px 24px",
            marginBottom: 28,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div>
              <p style={{ fontSize: "0.78rem", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                📅 Próxima clase
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 8px" }}>
                {format(proximaConfirmada.clase.fechaHora, "EEEE dd 'de' MMMM · HH:mm 'hs'", { locale: es })}
              </p>
              <span style={{ background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", borderRadius: 20, padding: "4px 14px", fontSize: "0.85rem", fontWeight: 600 }}>
                {proximaConfirmada.clase.disciplina.nombre}
              </span>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "12px 20px" }}>
                <p style={{ color: "#16a34a", fontWeight: 700, margin: "0 0 2px", display: "flex", alignItems: "center", gap: 6 }}>
                  ✓ Confirmada
                </p>
                <p style={{ color: "#4b7a58", fontSize: "0.8rem", margin: 0 }}>Tu lugar está asegurado</p>
              </div>
            </div>
          </div>
        )}

        {/* Mi actividad */}
        <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 12 }}>Mi actividad</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 24 }}>
          <StatCard icono="👤" color="#f0fdf4" iconColor="#16a34a" titulo="Ausencias" valor={ausenciasIndividual} subtitulo={ausenciasIndividual === 0 ? "Sin inconvenientes" : "Clases individuales"} />
          <StatCard icono="⚠️" color="#fefce8" iconColor="#ca8a04" titulo="Ausencias abono" valor={ausenciasAbono} subtitulo={ausenciasAbono === 0 ? "Sin inconvenientes" : "Clases de abono"} />
          <StatCard icono="🎁" color="#eff6ff" iconColor="#3b82f6" titulo="Clases gratis disponibles" valor={creditosDisponibles} subtitulo={creditosDisponibles > 0 ? "¡Aprovechala!" : "Sin créditos"} />
        </div>

        {/* Penalizaciones */}
        <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 12 }}>Penalizaciones</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 32 }}>
          <StatCard icono="❌" color="#fff1f2" iconColor="#e11d48" titulo="Penalizaciones individuales" valor={cancelacionesIndividual} subtitulo={recargoIndividualPendiente > 0 ? "Recargo pendiente de pago" : cancelacionesIndividual === 0 ? "Todo en orden" : `${avisosIndividualCicloActual} de ${3} avisos`} />
          <StatCard icono="❌" color="#fff1f2" iconColor="#e11d48" titulo="Penalizaciones abono" valor={cancelacionesAbono} subtitulo={recargoAbonoPendiente > 0 ? "Recargo pendiente de pago" : cancelacionesAbono === 0 ? "Todo en orden" : `${avisosAbonoCicloActual} de ${3} avisos`} />
        </div>

        {/* Grilla clases + lista de espera */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>

          {/* Próximas clases */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 12 }}>
              Próximas clases ({rangoDias} días)
            </p>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
              {proximasClases.length === 0 && (
                <p style={{ color: "var(--color-gray)", padding: 24, textAlign: "center", margin: 0 }}>
                  No tenés clases en los próximos {rangoDias} días.
                </p>
              )}
              {proximasClases.length > 0 && proximasClases.map((insc, i) => {
                const estaPresente = insc.clase.asistencias.some((a) => a.presente);
                const inicioVentana = new Date(insc.clase.fechaHora.getTime() - 10 * 60000);
                const finVentana = new Date(insc.clase.fechaHora.getTime() + (insc.clase.duracionMin + 30) * 60000);
                const estaEnVentana = ahora >= inicioVentana && ahora <= finVentana;

                return (
                  <div
                    key={insc.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 20px",
                      borderTop: i === 0 ? "none" : "1px solid #f3f4f6",
                      gap: 12,
                    }}
                  >
                    <Link
                      href={`/plataforma/cronograma?claseId=${insc.clase.id}`}
                      style={{ display: "flex", alignItems: "center", gap: 14, textDecoration: "none", color: "inherit", flex: 1 }}
                    >
                      <div style={{ background: "#f0fdf4", borderRadius: 10, padding: "8px 10px", textAlign: "center", minWidth: 48 }}>
                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#16a34a", fontWeight: 700, textTransform: "uppercase" }}>
                          {format(insc.clase.fechaHora, "EEE", { locale: es })}
                        </p>
                        <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#15803d" }}>
                          {format(insc.clase.fechaHora, "dd/MM")}
                        </p>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{insc.clase.titulo}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                          <span style={{ color: "#9ca3af", fontSize: "0.82rem" }}>{format(insc.clase.fechaHora, "HH:mm")} hs</span>
                          {insc.pago?.tipo === "MENSUALIDAD" && (
                            <span style={{ background: "rgba(168,85,247,0.1)", color: "#7c3aed", padding: "1px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>Abono</span>
                          )}
                          {insc.pago?.tipo === "CLASE_INDIVIDUAL" && (
                            <span style={{ background: "rgba(59,130,246,0.1)", color: "#1d4ed8", padding: "1px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>Individual</span>
                          )}
                          {!insc.pago?.tipo && (
                            <span style={{ background: "rgba(234,179,8,0.12)", color: "#92400e", padding: "1px 8px", borderRadius: 20, fontSize: "0.75rem", fontWeight: 600 }}>🎁 Clase gratis</span>
                          )}
                        </div>
                      </div>
                      {estaPresente ? (
                        <span style={{ marginLeft: "auto", background: "#f0fdf4", color: "#16a34a", borderRadius: 20, padding: "3px 12px", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          ✓ Presente
                        </span>
                      ) : !estaEnVentana ? (
                        <span style={{ marginLeft: "auto", background: "#f0fdf4", color: "#16a34a", borderRadius: 20, padding: "3px 12px", fontSize: "0.8rem", fontWeight: 600, whiteSpace: "nowrap" }}>
                          ✓ Confirmada
                        </span>
                      ) : null}
                    </Link>

                    {!estaPresente && estaEnVentana && (
                      <BotonEscanearCliente
                        claseId={insc.clase.id}
                        inicioVentana={inicioVentana.toISOString()}
                        finVentana={finVentana.toISOString()}
                      />
                    )}

                    {insc.clase.fechaHora >= new Date() && (
                      <BotonCancelarInscripcion inscripcionId={insc.id} />
                    )}
                  </div>
                );
              })}
              {(hayMasClases || rangoDias > 7) && (
                <div style={{ padding: "12px 20px", borderTop: proximasClases.length > 0 ? "1px solid #f3f4f6" : "none", display: "flex", gap: 16 }}>
                  {hayMasClases && (
                    <Link href={`/plataforma/mis-clases?dias=${rangoDias + 7}`} style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                      Ver más →
                    </Link>
                  )}
                  {rangoDias > 7 && (
                    <Link href={`/plataforma/mis-clases?dias=${rangoDias - 7}`} style={{ color: "#9ca3af", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                      Ver menos
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Lista de espera */}
          <div>
            <p style={{ fontWeight: 700, fontSize: "1rem", marginBottom: 12 }}>En lista de espera ({rangoEspera} días)</p>
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
              {pendientesActualizados.length === 0 && (
                <div style={{ padding: 28, textAlign: "center" }}>
                  <p style={{ fontSize: "2rem", margin: "0 0 8px" }}>⏳</p>
                  <p style={{ color: "#6b7280", margin: 0, fontSize: "0.9rem" }}>No estás en lista de espera para ninguna clase.</p>
                </div>
              )}
              {pendientesActualizados.length > 0 && pendientesActualizados.map((espera, i) => {
                  const elegible = !!espera.notificadoEn && espera.notificadoEn > ventanaNotificacion;
                  return (
                    <div key={espera.id} style={{ padding: "14px 20px", borderTop: i === 0 ? "none" : "1px solid #f3f4f6" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: elegible ? 10 : 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ background: "#fefce8", borderRadius: 10, padding: "8px 10px", textAlign: "center", minWidth: 48 }}>
                            <p style={{ margin: 0, fontSize: "0.7rem", color: "#ca8a04", fontWeight: 700, textTransform: "uppercase" }}>
                              {format(espera.clase.fechaHora, "EEE", { locale: es })}
                            </p>
                            <p style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#a16207" }}>
                              {format(espera.clase.fechaHora, "dd/MM")}
                            </p>
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, fontSize: "0.95rem" }}>{espera.clase.titulo}</p>
                            <p style={{ margin: 0, color: "#9ca3af", fontSize: "0.82rem" }}>
                              {format(espera.clase.fechaHora, "HH:mm")} hs · Posición {espera.posicion}
                            </p>
                          </div>
                        </div>
                        {espera.clase.fechaHora >= new Date() && (
                          <BotonCancelarListaEspera listaEsperaId={espera.id} />
                        )}
                      </div>
                      {elegible && (
                        <Link
                          href={`/plataforma/cronograma?claseId=${espera.claseId}&vista=resumen&tipoPago=CLASE_INDIVIDUAL&origen=listaEspera`}
                          style={{ display: "block", textAlign: "center", background: "#16a34a", color: "white", borderRadius: 8, padding: "8px 0", fontWeight: 700, fontSize: "0.88rem", textDecoration: "none" }}
                        >
                          ✅ Confirmar inscripción
                        </Link>
                      )}
                    </div>
                  );
                })}
              {(hayMasEspera || rangoEspera > 7) && (
                <div style={{ padding: "12px 20px", borderTop: pendientesActualizados.length > 0 ? "1px solid #f3f4f6" : "none", display: "flex", gap: 16 }}>
                  {hayMasEspera && (
                    <Link href={`/plataforma/mis-clases?dias=${rangoDias}&diasEspera=${rangoEspera + 7}`} style={{ color: "#16a34a", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                      Ver más →
                    </Link>
                  )}
                  {rangoEspera > 7 && (
                    <Link href={`/plataforma/mis-clases?dias=${rangoDias}&diasEspera=${rangoEspera - 7}`} style={{ color: "#9ca3af", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                      Ver menos
                    </Link>
                  )}
                </div>
              )}
            </div>
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
                        {clase.titulo} <span style={{ fontWeight: 400, color: "var(--color-gray)", fontSize: "0.95rem" }}>• {clase.disciplina.nombre}</span>
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
                        - {format(new Date(clase.fechaHora.getTime() + clase.duracionMin * 60000), "HH:mm")} hs
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

function StatCard({ icono, color, iconColor, titulo, valor, subtitulo }: {
  icono: string; color: string; iconColor: string; titulo: string; valor: number; subtitulo: string;
}) {
  return (
    <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 14, padding: "18px 20px", display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 44, height: 44, borderRadius: 12, background: color, display: "grid", placeItems: "center", fontSize: "1.3rem", flexShrink: 0 }}>
        {icono}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: "0.78rem", color: "#6b7280", fontWeight: 500 }}>{titulo}</p>
        <p style={{ margin: "2px 0", fontSize: "1.6rem", fontWeight: 800, color: iconColor, lineHeight: 1 }}>{valor}</p>
        <p style={{ margin: 0, fontSize: "0.75rem", color: iconColor, fontWeight: 600 }}>{subtitulo}</p>
      </div>
    </div>
  );
}

const BADGE_TIPO_PAGO: Record<string, { label: string; bg: string; color: string }> = {
  CLASE_INDIVIDUAL: { label: "Individual", bg: "rgba(59,130,246,0.1)", color: "#1d4ed8" },
  MENSUALIDAD:      { label: "Abono mensual", bg: "rgba(168,85,247,0.1)", color: "#7c3aed" },
};

function ClaseListItem({
  titulo,
  disciplina,
  fechaHora,
  estado,
  claseId,
  duracionMin,
  inscripcionId,
  listaEsperaId,
  tipoPago,
  elegibleListaEspera,
}: {
  titulo: string;
  disciplina: string;
  fechaHora: Date;
  estado: string;
  claseId?: number;
  duracionMin?: number;
  inscripcionId?: number;
  listaEsperaId?: number;
  tipoPago?: string | null;
  elegibleListaEspera?: boolean;
}) {
  let inicioVentana, finVentana, finClase;
  if (duracionMin !== undefined) {
    finClase = new Date(fechaHora.getTime() + duracionMin * 60000);
  }
  if (claseId && duracionMin !== undefined) {
    inicioVentana = new Date(fechaHora.getTime() - 10 * 60000).toISOString();
    finVentana = new Date(fechaHora.getTime() + (duracionMin + 30) * 60000).toISOString();
  }
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
        <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem" }}>
          {titulo} <span style={{ fontWeight: 400, color: "var(--color-gray)", fontSize: "0.9rem" }}>• {disciplina}</span>
        </h4>
        <p
          style={{
            margin: 0,
            color: "var(--color-gray)",
            fontSize: "0.85rem",
            textTransform: "capitalize",
          }}
        >
          {format(fechaHora, "EEEE d, HH:mm", { locale: es })}
          {finClase ? ` - ${format(finClase, "HH:mm")} hs` : " hs"}
        </p>
        {tipoPago !== undefined && (() => {
          const badge = tipoPago ? BADGE_TIPO_PAGO[tipoPago] : null;
          if (badge) {
            return (
              <span style={{ display: "inline-block", marginTop: 6, background: badge.bg, color: badge.color, padding: "2px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
                {badge.label}
              </span>
            );
          }
          return (
            <span style={{ display: "inline-block", marginTop: 6, background: "rgba(234,179,8,0.12)", color: "#92400e", padding: "2px 10px", borderRadius: 20, fontSize: "0.78rem", fontWeight: 600 }}>
              🎁 Clase gratis
            </span>
          );
        })()}
      </div>
      <div style={{ textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
        {estado !== "Confirmada" && (
          <div
            style={{
              background: "rgba(234, 179, 8, 0.1)",
              color: "#ca8a04",
              padding: "4px 10px",
              borderRadius: 8,
              fontSize: "0.8rem",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            {estado}
          </div>
        )}
        {claseId && inicioVentana && finVentana && estado === "Confirmada" && (
          <BotonEscanearCliente
            claseId={claseId}
            inicioVentana={inicioVentana}
            finVentana={finVentana}
          />
        )}

        {inscripcionId && estado === "Confirmada" && fechaHora >= new Date() && (
          <BotonCancelarInscripcion inscripcionId={inscripcionId} />
        )}

        {listaEsperaId && elegibleListaEspera && claseId && (
          <Link
            href={`/plataforma/cronograma?claseId=${claseId}&vista=resumen&tipoPago=CLASE_INDIVIDUAL&origen=listaEspera`}
            style={{
              display: "block",
              textAlign: "center",
              borderRadius: 8,
              padding: "8px 14px",
              background: "#16a34a",
              color: "white",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: "0.88rem",
              whiteSpace: "nowrap",
            }}
          >
            ✅ Confirmar inscripción
          </Link>
        )}

        {listaEsperaId && fechaHora >= new Date() && (
          <BotonCancelarListaEspera listaEsperaId={listaEsperaId} />
        )}

      </div>
    </div>
  );
}