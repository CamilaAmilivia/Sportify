"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function BotonAsistencia({
  claseId,
  inicioVentana,
  finVentana,
}: {
  claseId: number;
  inicioVentana: string;
  finVentana: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const inicio = new Date(inicioVentana);
  const fin = new Date(finVentana);

  const manejarClick = () => {
    const ahoraActual = new Date();
    if (ahoraActual < inicio) {
      setError("No es posible tomar asistencia fuera del horario");
      setTimeout(() => setError(""), 4000);
    } else if (ahoraActual > fin) {
      setError("Cerró la asistencia para esta clase");
      setTimeout(() => setError(""), 4000);
    } else {
      setError("");
      router.push(`/plataforma/asistencia/${claseId}`);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
      <button
        onClick={manejarClick}
        style={{
          background: "#22c55e",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: 8,
          fontWeight: 600,
          cursor: "pointer",
          fontSize: "0.9rem",
          transition: "opacity 0.2s ease",
        }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Tomar asistencia
      </button>
      {error && <span className="form-error">⚠ {error}</span>}
    </div>
  );
}
