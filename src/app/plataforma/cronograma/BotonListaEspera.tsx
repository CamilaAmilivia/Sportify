"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { anotarseListaEspera } from "./actions";

export function BotonListaEspera({ claseId }: { claseId: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inscripto, setInscripto] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function handleConfirmar() {
    setCargando(true);
    setError(null);
    setConfirmando(false);

    try {
      await anotarseListaEspera(claseId);
      setInscripto(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar la inscripción.");
    } finally {
      setCargando(false);
    }
  }

  if (inscripto) {
    return (
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
        ✓ Te anotaste en la lista de espera
      </div>
    );
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
          marginTop: 24,
          borderRadius: 10,
          padding: "14px 16px",
          background: cargando ? "#9ca3af" : "#eab308",
          color: "white",
          fontWeight: 700,
          border: "none",
          cursor: cargando ? "default" : "pointer",
        }}
      >
        {cargando ? "Anotando..." : "Inscribirme a lista de espera"}
      </button>

      {error && (
        <p style={{ marginTop: 8, color: "#dc2626", fontSize: "0.9rem" }}>
          {error}
        </p>
      )}

      {confirmando && (
        <div
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
            style={{
              background: "white",
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              width: "90%",
              boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: "1.2rem" }}>
              ⏳ Confirmar lista de espera
            </h3>
            <p style={{ color: "#6b7280", margin: "0 0 24px", fontSize: "0.95rem", lineHeight: 1.5 }}>
              Te anotarás en la lista de espera. Cuando se libere un cupo serás notificado y tendrás <strong>24 horas</strong> para confirmar tu inscripción antes de que el lugar pase al siguiente.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setConfirmando(false)}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "1px solid #e5e7eb",
                  background: "white",
                  color: "#374151",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmar}
                style={{
                  flex: 1,
                  padding: "12px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: "#eab308",
                  color: "white",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
