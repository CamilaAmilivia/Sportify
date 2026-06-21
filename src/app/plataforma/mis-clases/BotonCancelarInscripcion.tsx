"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelarInscripcion,
  obtenerConfirmacionCancelacion,
} from "./actions";
import type {
  PenalizacionCancelacion,
  RecargoFuturo,
} from "@/lib/penalizaciones";

type DatosConfirmacion = {
  clase: {
    titulo: string;
    disciplina: string;
    fechaHora: Date;
  };
  penalizaciones: PenalizacionCancelacion[];
  recargosFuturos: RecargoFuturo[];
};

export function BotonCancelarInscripcion({
  inscripcionId,
}: {
  inscripcionId: number;
}) {
  const router = useRouter();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(false);
  const [cargandoCancelacion, setCargandoCancelacion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [datos, setDatos] = useState<DatosConfirmacion | null>(null);

  async function abrirModal() {
    setMostrarModal(true);
    setCargandoDatos(true);
    setError(null);

    try {
      const info = await obtenerConfirmacionCancelacion(inscripcionId);
      setDatos(info);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cargar la información de cancelación."
      );
    } finally {
      setCargandoDatos(false);
    }
  }

  function cerrarModal() {
    setMostrarModal(false);
    setDatos(null);
    setError(null);
  }

  async function confirmarCancelacion() {
    setCargandoCancelacion(true);
    setError(null);

    try {
      await cancelarInscripcion(inscripcionId);
      setMostrarModal(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar la inscripción."
      );
      setCargandoCancelacion(false);
    }
  }

  return (
    <>
      <button
        onClick={abrirModal}
        style={{
          background: "transparent",
          color: "#dc2626",
          border: "1px solid #dc2626",
          padding: "6px 12px",
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
      >
        Cancelar
      </button>

      {mostrarModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            padding: 24,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 24,
              borderRadius: 16,
              width: "100%",
              maxWidth: 440,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.2rem" }}>
              ¿Cancelar tu inscripción?
            </h2>

            {cargandoDatos && (
              <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                Cargando información...
              </p>
            )}

            {datos && (
              <>
                <p style={{ margin: 0, color: "#374151", fontSize: "0.95rem" }}>
                  {datos.clase.titulo} • {datos.clase.disciplina}
                  <br />
                  {new Date(datos.clase.fechaHora).toLocaleString("es-AR", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </p>

                {datos.penalizaciones.length > 0 && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <strong style={{ color: "#b91c1c", fontSize: "0.9rem" }}>
                      Penalizaciones por esta cancelación
                    </strong>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                      {datos.penalizaciones.map((p, i) => (
                        <li key={i} style={{ fontSize: "0.85rem", color: "#7f1d1d", marginBottom: 6 }}>
                          <strong>{p.titulo}:</strong> {p.descripcion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {datos.recargosFuturos.length > 0 && (
                  <div
                    style={{
                      background: "#fff7ed",
                      border: "1px solid #fed7aa",
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <strong style={{ color: "#c2410c", fontSize: "0.9rem" }}>
                      Posibles recargos futuros
                    </strong>
                    <ul style={{ margin: "8px 0 0", paddingLeft: 18 }}>
                      {datos.recargosFuturos.map((r, i) => (
                        <li key={i} style={{ fontSize: "0.85rem", color: "#9a3412", marginBottom: 6 }}>
                          <strong>{r.titulo}:</strong> {r.descripcion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {error && (
              <p style={{ margin: 0, color: "#dc2626", fontSize: "0.85rem" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                onClick={cerrarModal}
                disabled={cargandoCancelacion}
                style={{
                  flex: 1,
                  background: "white",
                  color: "#374151",
                  border: "1px solid #d1d5db",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Volver
              </button>

              <button
                onClick={confirmarCancelacion}
                disabled={cargandoDatos || cargandoCancelacion}
                style={{
                  flex: 1,
                  background: cargandoCancelacion ? "#9ca3af" : "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: cargandoCancelacion ? "default" : "pointer",
                }}
              >
                {cargandoCancelacion ? "Cancelando..." : "Confirmar cancelación"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
