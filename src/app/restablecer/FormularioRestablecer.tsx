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
        <input
          type="password"
          id="password"
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${state.errores?.password ? "var(--color-red)" : "var(--color-gray-light)"}`,
            fontSize: "1rem",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            outline: "none",
            background: "var(--color-gray-light)",
          }}
        />
        {state.errores?.password && (
          <span style={{ color: "var(--color-red)", fontSize: "0.85rem" }}>
            {state.errores.password[0]}
          </span>
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
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={{
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${state.errores?.confirmPassword ? "var(--color-red)" : "var(--color-gray-light)"}`,
            fontSize: "1rem",
            fontFamily: "inherit",
            transition: "all 0.2s ease",
            outline: "none",
            background: "var(--color-gray-light)",
          }}
        />
        {state.errores?.confirmPassword && (
          <span style={{ color: "var(--color-red)", fontSize: "0.85rem" }}>
            {state.errores.confirmPassword[0]}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        style={{
          background: "var(--color-green)",
          color: "var(--color-dark)",
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
