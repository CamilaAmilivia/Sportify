"use client";

import { useState } from "react";
import { TIPOS_PAGO, type TipoPagoSportify } from "@/lib/pagos";

type BotonPagarMercadoPagoProps = {
  claseId: number;
  usuarioId: number;
  tipoPago?: TipoPagoSportify;
};

export function BotonPagarMercadoPago({
  claseId,
  usuarioId,
  tipoPago = TIPOS_PAGO.CLASE_INDIVIDUAL,
}: BotonPagarMercadoPagoProps) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pagar() {
    try {
      setCargando(true);
      setError(null);

      const response = await fetch("/api/mercado-pago/preferencia", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          claseId,
          usuarioId,
          tipoPago,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detalle ?? data.error ?? "No se pudo iniciar el pago");
        return;
      }

      if (!data.initPoint) {
        setError("No se recibió el link de pago");
        return;
      }

    window.open(
  data.initPoint,
  "_blank",
  "noopener,noreferrer"
);

    } catch (error) {
      console.error("Error iniciando pago:", error);
      setError("Error al iniciar el pago");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={pagar}
        disabled={cargando}
        style={{
          width: "100%",
          border: "none",
          borderRadius: 10,
          padding: "14px 16px",
          background: cargando ? "#9ca3af" : "#22c55e",
          color: "white",
          fontWeight: 700,
          cursor: cargando ? "not-allowed" : "pointer",
        }}
      >
        {cargando ? "Abriendo Mercado Pago..." : "Pagar"}
      </button>

      {error && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#b91c1c",
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}