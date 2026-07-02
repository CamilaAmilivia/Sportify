"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { inscribirseConCredito } from "./actions";

export function BotonUsarCredito({
  claseId,
  creditosDisponibles,
}: {
  claseId: number;
  creditosDisponibles: number;
}) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirmar() {
    setCargando(true);
    setError(null);
    setConfirmando(false);

    try {
      await inscribirseConCredito(claseId);
      router.push(`/plataforma/cronograma?claseId=${claseId}&toast=credito-ok`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo usar el crédito de clase gratis."
      );
      setCargando(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setConfirmando(true)}
        disabled={cargando}
        style={{
          display: "block",
          width: "100%",
          textAlign: "center",
          marginTop: 12,
          borderRadius: 10,
          padding: "14px 16px",
          background: cargando ? "#9ca3af" : "#7c3aed",
          color: "white",
          fontWeight: 700,
          border: "none",
          cursor: cargando ? "default" : "pointer",
        }}
      >
        {cargando
          ? "Inscribiendo..."
          : `🎁 Usar clase gratis (tenés ${creditosDisponibles} disponible${creditosDisponibles === 1 ? "" : "s"})`}
      </button>

      {confirmando && (
        <div
          onClick={() => setConfirmando(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "white",
              borderRadius: 16,
              padding: "28px 24px",
              maxWidth: 380,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <p style={{ fontSize: "1.5rem", margin: "0 0 8px", textAlign: "center" }}>🎁</p>
            <h3 style={{ margin: "0 0 8px", fontSize: "1.1rem", textAlign: "center" }}>
              ¿Usar clase gratis?
            </h3>
            <p style={{ margin: "0 0 20px", color: "#6b7280", fontSize: "0.88rem", textAlign: "center" }}>
              Se descontará 1 crédito de tus {creditosDisponibles} disponibles.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setConfirmando(false)}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  border: "1px solid #d1d5db",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                style={{
                  flex: 1,
                  padding: "11px",
                  background: "#7c3aed",
                  color: "white",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Sí, usar crédito
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <p style={{ marginTop: 8, color: "#dc2626", fontSize: "0.9rem" }}>
          {error}
        </p>
      )}
    </>
  );
}
