"use client";

import { useState, useActionState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { checkTokenValidity, restablecerContrasena } from "./actions";
import Link from "next/link";

export default function FormularioRestablecer() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [state, formAction, isPending] = useActionState(restablecerContrasena, {});
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);

  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(true);

  // Polling para validar el token
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (state.exito) {
      return;
    }

    const validate = async () => {
      if (!token) {
        setIsTokenValid(false);
        setIsValidating(false);
        return;
      }

      const valid = await checkTokenValidity(token);
      setIsTokenValid(valid);
      setIsValidating(false);

      if (!valid && intervalId) {
        clearInterval(intervalId);
      }
    };

    // Validar inmediatamente al montar
    validate();

    // Luego validar cada 5 segundos
    intervalId = setInterval(validate, 5000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [token, state.exito]);

  if (isValidating) {
    return <p style={{ textAlign: "center", color: "var(--color-gray)" }}>Validando enlace...</p>;
  }

  // Si el componente Action devolvió un error de token, o el polling lo invalidó
  if (!isTokenValid || state.mensaje === "El enlace es inválido o expiró. Por favor solicitá uno nuevo.") {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            color: "var(--color-red)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          El enlace expiró o es inválido. Prueba solicitando otro.
        </div>
        <Link
          href="/recuperar"
          style={{
            display: "inline-block",
            background: "var(--color-green)",
            color: "var(--color-dark)",
            padding: "12px 24px",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Solicitar nuevo enlace
        </Link>
      </div>
    );
  }

  if (state.exito) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "16px",
            color: "var(--color-green)",
            fontSize: "0.95rem",
            lineHeight: 1.5,
            marginBottom: 24,
          }}
        >
          ¡Contraseña actualizada con éxito!
        </div>
        <Link
          href="/login"
          style={{
            display: "inline-block",
            background: "var(--color-green)",
            color: "var(--color-white)",
            padding: "12px 24px",
            borderRadius: "var(--radius-md)",
            fontWeight: 600,
            textDecoration: "none",
          }}
        >
          Iniciar sesión
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <input type="hidden" name="token" value={token} />

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

      {/* Nueva Contraseña */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          htmlFor="password"
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--color-dark)",
          }}
        >
          Nueva contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={mostrarPassword ? "text" : "password"}
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              padding: "12px 16px",
              paddingRight: "2.8rem",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${state.errores?.password ? "var(--color-red)" : "var(--color-gray-light)"}`,
              fontSize: "1rem",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
              outline: "none",
              background: "var(--color-gray-light)",
              width: "100%",
            }}
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
              fontSize: "1.1rem",
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

      {/* Confirmar Contraseña */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <label
          htmlFor="confirmPassword"
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "var(--color-dark)",
          }}
        >
          Confirmar contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            type={mostrarConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            name="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{
              padding: "12px 16px",
              paddingRight: "2.8rem",
              borderRadius: "var(--radius-md)",
              border: `1px solid ${state.errores?.confirmPassword ? "var(--color-red)" : "var(--color-gray-light)"}`,
              fontSize: "1rem",
              fontFamily: "inherit",
              transition: "all 0.2s ease",
              outline: "none",
              background: "var(--color-gray-light)",
              width: "100%",
            }}
          />
          <button
            type="button"
            onClick={() => setMostrarConfirmPassword((v) => !v)}
            aria-label={mostrarConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
              fontSize: "1.1rem",
              color: "var(--color-gray)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {mostrarConfirmPassword ? (
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
        {state.errores?.confirmPassword && (
          <span className="form-error">⚠ {state.errores.confirmPassword[0]}</span>
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
        {isPending ? "Procesando..." : "Confirmar"}
      </button>
    </form>
  );
}
