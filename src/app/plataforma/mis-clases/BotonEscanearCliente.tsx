"use client";

import { useState } from "react";
import { ScannerModal } from "./ScannerModal";

export function BotonEscanearCliente({
  claseId,
  inicioVentana,
  finVentana,
}: {
  claseId: number;
  inicioVentana: string;
  finVentana: string;
}) {
  const [error, setError] = useState("");
  const [mostrarScanner, setMostrarScanner] = useState(false);

  const inicio = new Date(inicioVentana);
  const fin = new Date(finVentana);

  const manejarClick = () => {
    const ahoraActual = new Date();
    if (ahoraActual < inicio) {
      setError("No es posible registrar su asistencia antes de horario");
      setTimeout(() => setError(""), 4000);
    } else if (ahoraActual > fin) {
      setError("Ya cerró la asistencia para esta clase");
      setTimeout(() => setError(""), 4000);
    } else {
      setError("");
      setMostrarScanner(true);
    }
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <button
          onClick={manejarClick}
          style={{
            background: "var(--color-dark)",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: "0.9rem",
            transition: "opacity 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
          onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
        >
          <span>📷</span> Escanear asistencia
        </button>
        {error && <span className="form-error">⚠ {error}</span>}
      </div>

      {mostrarScanner && (
        <ScannerModal
          claseId={claseId}
          onClose={() => setMostrarScanner(false)}
        />
      )}
    </>
  );
}
