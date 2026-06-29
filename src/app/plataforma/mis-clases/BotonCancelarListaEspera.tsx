"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelarListaEspera } from "./actions";

export function BotonCancelarListaEspera({
  listaEsperaId,
}: {
  listaEsperaId: number;
}) {
  const router = useRouter();
  const [mostrarModal, setMostrarModal] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirmarCancelacion() {
    setCargando(true);
    setError(null);

    try {
      await cancelarListaEspera(listaEsperaId);
      setMostrarModal(false);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo cancelar tu lugar en la lista de espera."
      );
      setCargando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setMostrarModal(true)}
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
              ¿Salir de la lista de espera?
            </h2>

            <div
              style={{
                background: "#fff7ed",
                border: "1px solid #fed7aa",
                borderRadius: 10,
                padding: 14,
              }}
            >
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#9a3412" }}>
                ⚠️ Si confirmás, vas a <strong>perder tu prioridad</strong> en la
                lista de espera. Si querés volver a anotarte más adelante,
                vas a entrar al final de la fila.
              </p>
            </div>

            {error && (
              <p style={{ margin: 0, color: "#dc2626", fontSize: "0.85rem" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              <button
                onClick={() => setMostrarModal(false)}
                disabled={cargando}
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
                disabled={cargando}
                style={{
                  flex: 1,
                  background: cargando ? "#9ca3af" : "#dc2626",
                  color: "white",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: cargando ? "default" : "pointer",
                }}
              >
                {cargando ? "Cancelando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
