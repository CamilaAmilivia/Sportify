"use client";

import { useState, useActionState } from "react";
import { solicitarRecuperacion } from "./actions";

export default function FormularioRecuperar() {
  const [state, formAction, isPending] = useActionState(solicitarRecuperacion, {});
  const [email, setEmail] = useState("");

  if (state.exito) {
    return (
      <div
        style={{
          background: "rgba(34, 197, 94, 0.1)",
          border: "1px solid rgba(34, 197, 94, 0.2)",
          borderRadius: "var(--radius-md)",
          padding: "16px",
          color: "var(--color-green)",
          fontSize: "0.95rem",
          lineHeight: 1.5,
          textAlign: "center",
        }}
      >
        ¡Listo! Revisá tu casilla: si existe una cuenta asociada a tu correo electrónico vas a recibir un mail con un enlace para restablecer tu contraseña.
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {state.mensaje && (
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "12px",
            color: "var(--color-red)",
            fontSize: "0.9rem",
            marginBottom: 8,
          }}
        >
          {state.mensaje}
        </div>
      )}

      {/* Email */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          htmlFor="email"
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--color-dark)",
          }}
        >
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          required
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${state.errores?.email ? "var(--color-red)" : "var(--color-gray-light)"}`,
            fontSize: "1rem",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            outline: "none",
            background: "var(--color-gray-light)",
          }}
        />
        {state.errores?.email && (
          <span style={{ color: "var(--color-red)", fontSize: "0.85rem" }}>
            {state.errores.email[0]}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          background: "var(--color-green)",
          color: "var(--color-white)",
          padding: "14px 24px",
          borderRadius: "var(--radius-md)",
          border: "none",
          fontSize: "1rem",
          fontWeight: 700,
          cursor: isPending ? "not-allowed" : "pointer",
          transition: "transform 0.2s ease, opacity 0.2s ease",
          marginTop: 8,
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Enviando..." : "Confirmar"}
      </button>
    </form>
  );
}
