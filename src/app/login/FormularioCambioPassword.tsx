"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { cambiarPasswordPrimerLogin } from "./actions";

function BotonSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        padding: "12px 16px",
        border: "none",
        borderRadius: 8,
        background: "#22c55e",
        color: "white",
        fontWeight: 600,
        cursor: pending ? "not-allowed" : "pointer",
        opacity: pending ? 0.7 : 1,
      }}
    >
      {pending ? "Confirmando..." : "Confirmar"}
    </button>
  );
}

export function FormularioCambioPassword({
  email,
  passwordActual,
  onClose,
}: {
  email: string;
  passwordActual: string;
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(cambiarPasswordPrimerLogin, {});
  const [mostrarPasswordNueva, setMostrarPasswordNueva] = useState(false);
  const [mostrarPasswordConfirmacion, setMostrarPasswordConfirmacion] = useState(false);

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: 18,
          padding: 32,
          maxWidth: 450,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "var(--color-dark)",
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Actualización obligatoria de seguridad
        </h2>

        <p style={{ marginBottom: 24, fontSize: "0.95rem", color: "var(--color-gray)", lineHeight: 1.5 }}>
          Por razones de seguridad, te solicitamos que cambies tu contraseña luego de tu primer inicio de sesión.
        </p>

        {state.errores?.general && (
          <div
            style={{
              background: "#fee2e2",
              color: "#dc2626",
              padding: 12,
              borderRadius: 8,
              marginBottom: 16,
              fontSize: "0.95rem",
            }}
          >
            {state.errores.general[0]}
          </div>
        )}

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="passwordActual" value={passwordActual} />

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "var(--color-dark)",
              }}
            >
              Nueva contraseña *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarPasswordNueva ? "text" : "password"}
                name="passwordNueva"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  paddingRight: "2.8rem",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setMostrarPasswordNueva((v) => !v)}
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
                {mostrarPasswordNueva ? (
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
            {state.errores?.passwordNueva && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>
                ⚠ {state.errores.passwordNueva[0]}
              </span>
            )}
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "var(--color-dark)",
              }}
            >
              Confirmar contraseña *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={mostrarPasswordConfirmacion ? "text" : "password"}
                name="passwordNuevaConfirmacion"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  paddingRight: "2.8rem",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setMostrarPasswordConfirmacion((v) => !v)}
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
                {mostrarPasswordConfirmacion ? (
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
            {state.errores?.passwordNuevaConfirmacion && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>
                ⚠ {state.errores.passwordNuevaConfirmacion[0]}
              </span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "12px 16px",
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: 8,
                background: "white",
                color: "var(--color-dark)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancelar
            </button>
            <BotonSubmit />
          </div>
        </form>
      </div>
    </div>
  );
}
