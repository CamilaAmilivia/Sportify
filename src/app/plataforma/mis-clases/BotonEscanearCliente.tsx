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
  const [cargando, setCargando] = useState(false);
  const [mostrarScanner, setMostrarScanner] = useState(false);

  const inicio = new Date(inicioVentana);
  const fin = new Date(finVentana);

  const manejarClick = async () => {
    const ahoraActual = new Date();

    if (ahoraActual < inicio) {
      setError("No es posible registrar su asistencia antes de horario");
      setTimeout(() => setError(""), 4000);
      return;
    }
    if (ahoraActual > fin) {
      setError("Ya cerró la asistencia para esta clase");
      setTimeout(() => setError(""), 4000);
      return;
    }

    // Verificar si la asistencia ya fue registrada
    setCargando(true);
    try {
      const res = await fetch(`/api/asistencia/verificar?claseId=${claseId}`);
      const data = await res.json();
      if (data.registrada) {
        setError("Tu asistencia ya fue registrada para esta clase ✓");
        setTimeout(() => setError(""), 5000);
        return;
      }
    } catch {
      // Si falla la verificación, dejamos pasar al scanner de todas formas
    } finally {
      setCargando(false);
    }

    setError("");
    setMostrarScanner(true);
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <button
          onClick={manejarClick}
          disabled={cargando}
          style={{
            background: "var(--color-dark)",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600,
            cursor: cargando ? "wait" : "pointer",
            fontSize: "0.9rem",
            transition: "opacity 0.2s ease",
            display: "flex",
            alignItems: "center",
            gap: 6,
            opacity: cargando ? 0.7 : 1,
          }}
          onMouseOver={(e) => { if (!cargando) e.currentTarget.style.opacity = "0.9"; }}
          onMouseOut={(e) => { if (!cargando) e.currentTarget.style.opacity = "1"; }}
        >
          <span>{cargando ? "⏳" : "📷"}</span>
          {cargando ? "Verificando..." : "Escanear asistencia"}
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
