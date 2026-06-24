"use client";

import { useState } from "react";
import { confirmarInscripcionAbonado } from "./actions";

interface Props {
  listaEsperaId: number;
  claseId: number;
  usuarioId: number;
  tipo: "ABONADO" | "CLASE_INDIVIDUAL";
}

export function BotonConfirmarInscripcion({
  listaEsperaId,
  claseId,
  usuarioId,
  tipo,
}: Props) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setCargando(true);
    setError(null);

    try {
      if (tipo === "ABONADO") {
        await confirmarInscripcionAbonado(listaEsperaId);
        // Si no lanza error, el Server Action revalida la ruta y el componente se desmonta o actualiza
      } else {
        // Redirigir a Mercado Pago para No Abonados
        const res = await fetch("/api/mercado-pago/preferencia", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            claseId,
            usuarioId,
            tipoPago: "CLASE_INDIVIDUAL",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Error al iniciar el pago");
        }

        if (data.initPoint) {
          window.location.href = data.initPoint;
        } else {
          throw new Error("No se pudo obtener el enlace de pago");
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button
        onClick={handleClick}
        disabled={cargando}
        style={{
          background: "#16a34a",
          color: "white",
          border: "none",
          padding: "8px 16px",
          borderRadius: 8,
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: cargando ? "not-allowed" : "pointer",
          opacity: cargando ? 0.7 : 1,
          transition: "background 0.2s ease",
          width: "100%",
        }}
        onMouseOver={(e) => {
          if (!cargando) e.currentTarget.style.background = "#15803d";
        }}
        onMouseOut={(e) => {
          if (!cargando) e.currentTarget.style.background = "#16a34a";
        }}
      >
        {cargando ? "Procesando..." : "Confirmar Inscripción"}
      </button>
      {error && (
        <span
          style={{
            color: "#dc2626",
            fontSize: "0.8rem",
            background: "#fef2f2",
            padding: "4px 8px",
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
