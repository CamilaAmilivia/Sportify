"use client";

import { useActionState, useState, useEffect } from "react";
import Link from "next/link";
import { iniciarSesion, LoginState } from "./actions";
import { FormularioCambioPassword } from "./FormularioCambioPassword";

const estadoInicial: LoginState = {};

export default function FormularioLogin() {
  const [state, action, isPending] = useActionState(
    iniciarSesion,
    estadoInicial
  );
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    if (state.requiereCambioPassword) {
      setShowModal(true);
    }
  }, [state.requiereCambioPassword]);

  return (
    <>
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
        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={mostrarPassword ? "text" : "password"}
            placeholder="••••••••"
            className="form-input"
            style={{ paddingRight: "2.8rem" }}
            required
          />
          <button
            type="button"
            onClick={() => setMostrarPassword((v) => !v)}
            aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              lineHeight: 1,
              color: "var(--color-gray)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {mostrarPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            )}
          </button>
        </div>
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
    
    {state.requiereCambioPassword && showModal && state.emailConfirmado && state.passwordActual && (
      <FormularioCambioPassword
        email={state.emailConfirmado}
        passwordActual={state.passwordActual}
        onClose={() => setShowModal(false)}
      />
    )}
    </>
  );
}
