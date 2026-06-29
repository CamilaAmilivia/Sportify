"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { anotarseListaEspera } from "./actions";

export function BotonListaEspera({ claseId }: { claseId: number }) {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inscripto, setInscripto] = useState(false);

  async function handleClick() {
    setCargando(true);
    setError(null);

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
        onClick={handleClick}
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
    </>
  );
}
