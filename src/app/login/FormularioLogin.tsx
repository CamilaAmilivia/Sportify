"use client";

import { useActionState } from "react";
import Link from "next/link";
import { iniciarSesion, LoginState } from "./actions";

const estadoInicial: LoginState = {};

export default function FormularioLogin() {
  const [state, action, isPending] = useActionState(
    iniciarSesion,
    estadoInicial
  );

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Mensaje de éxito */}
      {state.exito && (
        <div
          style={{
            padding: "16px",
            background: "var(--color-green-light)",
            color: "var(--color-green-dark)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid rgba(91, 190, 68, 0.3)",
            fontSize: "0.95rem",
            fontWeight: 500,
            textAlign: "center",
          }}
        >
          ✅ {state.mensaje}
          <p style={{ fontSize: "0.85rem", marginTop: 4, opacity: 0.9 }}>
            (Inicio de sesión verificado con éxito. Funcionalidad posterior en desarrollo)
          </p>
        </div>
      )}

      {/* Error general */}
      {state.errores?.general && (
        <div
          style={{
            padding: "14px 16px",
            background: "#FEE2E2",
            color: "#991B1B",
            borderRadius: "var(--radius-sm)",
            border: "1px solid #FCA5A5",
            fontSize: "0.9rem",
            fontWeight: 500,
          }}
        >
          ⚠ {state.errores.general[0]}
        </div>
      )}

      {/* Email */}
      <div className="form-field">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="ingresa@tuemail.com"
          className="form-input"
          required
        />
        {state.errores?.email && (
          <span className="form-error">⚠ {state.errores.email[0]}</span>
        )}
      </div>

      {/* Contraseña */}
      <div className="form-field">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          className="form-input"
          required
        />
        {state.errores?.password && (
          <span className="form-error">⚠ {state.errores.password[0]}</span>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="btn-submit-login"
        className="btn-primary"
        disabled={isPending}
        style={{
          marginTop: 8,
          padding: "14px",
          fontSize: "1rem",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Verificando..." : "Iniciar sesión"}
      </button>
    </form>
  );
}
