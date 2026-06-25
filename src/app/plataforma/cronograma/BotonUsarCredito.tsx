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
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setCargando(true);
    setError(null);

    try {
      await inscribirseConCredito(claseId);
      router.refresh();
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
        onClick={handleClick}
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

      {error && (
        <p style={{ marginTop: 8, color: "#dc2626", fontSize: "0.9rem" }}>
          {error}
        </p>
      )}
    </>
  );
}
