"use client";

import { useState } from "react";

type TipoPago = "MENSUALIDAD" | "CLASE_INDIVIDUAL";

type BotonPagarMercadoPagoProps = {
  claseId: number;
  usuarioId: number;
  tipoPago: TipoPago;
  disabled?: boolean;
};

export function BotonPagarMercadoPago({
  claseId,
  usuarioId,
  tipoPago,
  disabled = false,
}: BotonPagarMercadoPagoProps) {
  const [cargando, setCargando] = useState(false);

  async function pagar() {
    try {
      setCargando(true);

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
        alert(data.error ?? "No se pudo iniciar el pago");
        return;
      }

      window.location.href = data.initPoint;
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error al iniciar el pago");
    } finally {
      setCargando(false);
    }
  }

  return (
    <button
      type="button"
      onClick={pagar}
      disabled={disabled || cargando}
      style={{
        width: "100%",
        border: "none",
        borderRadius: 10,
        padding: "14px 16px",
        background: disabled || cargando ? "#9ca3af" : "#22c55e",
        color: "white",
        fontWeight: 700,
        cursor: disabled || cargando ? "not-allowed" : "pointer",
      }}
    >
      {cargando ? "Redirigiendo..." : "💳 Proceder al Pago"}
    </button>
  );
}