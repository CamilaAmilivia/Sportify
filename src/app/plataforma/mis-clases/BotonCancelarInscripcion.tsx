"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelarInscripcion,
  obtenerConfirmacionCancelacion,
} from "./actions";
import type { PenalizacionCancelacion } from "@/lib/penalizaciones";

type DatosConfirmacion = {
  clase: {
    titulo: string;
    disciplina: string;
    fechaHora: Date;
  };
  penalizacion: PenalizacionCancelacion | null;
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

                {datos.penalizacion ? (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      borderRadius: 10,
                      padding: 14,
                    }}
                  >
                    <strong style={{ color: "#b91c1c", fontSize: "0.9rem" }}>
                      {datos.penalizacion.titulo}
                    </strong>
                    <p style={{ margin: "6px 0 0", fontSize: "0.85rem", color: "#7f1d1d" }}>
                      {datos.penalizacion.descripcion}
                    </p>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "0.9rem" }}>
                    ¿Estás seguro/a que querés cancelar tu inscripción? Esta acción no se puede deshacer.
                  </p>
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
