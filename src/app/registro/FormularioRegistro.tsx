"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registrarCliente, RegistroState } from "./actions";

const estadoInicial: RegistroState = {};

export default function FormularioRegistro() {
  const [state, action, isPending] = useActionState(
    registrarCliente,
    estadoInicial
  );

  if (state.exito) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 24px",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: 16 }}>✅</div>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "var(--color-dark)",
            marginBottom: 8,
          }}
        >
          ¡Registro exitoso!
        </h2>
        <p style={{ color: "var(--color-gray)", marginBottom: 28 }}>
          {state.mensaje}
        </p>
        <Link href="/" className="btn-primary">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <form
      action={action}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      {/* Fila: DNI */}
      <div className="form-field">
        <label htmlFor="dni" className="form-label">
          DNI
        </label>
        <input
          id="dni"
          name="dni"
          type="text"
          placeholder="Ej: 12345678"
          className="form-input"
          required
        />
        {state.errores?.dni && (
          <span className="form-error">⚠ {state.errores.dni[0]}</span>
        )}
      </div>

      {/* Fila: Nombre + Apellido */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div className="form-field">
          <label htmlFor="nombre" className="form-label">
            Nombre
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            placeholder="Juan"
            className="form-input"
            required
          />
          {state.errores?.nombre && (
            <span className="form-error">⚠ {state.errores.nombre[0]}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="apellido" className="form-label">
            Apellido
          </label>
          <input
            id="apellido"
            name="apellido"
            type="text"
            placeholder="Pérez"
            className="form-input"
            required
          />
          {state.errores?.apellido && (
            <span className="form-error">⚠ {state.errores.apellido[0]}</span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="form-field">
        <label htmlFor="email" className="form-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="juan@mail.com"
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
          placeholder="Mínimo 6 caracteres"
          className="form-input"
          required
        />
        {state.errores?.password && (
          <span className="form-error">⚠ {state.errores.password[0]}</span>
        )}
      </div>

      {/* Fecha de nacimiento */}
      <div className="form-field">
        <label htmlFor="fechaNac" className="form-label">
          Fecha de nacimiento
        </label>
        <input
          id="fechaNac"
          name="fechaNac"
          type="date"
          className="form-input"
          required
        />
        {state.errores?.fechaNac && (
          <span className="form-error">⚠ {state.errores.fechaNac[0]}</span>
        )}
      </div>

      {/* Apto físico */}
      <div className="form-field">
        <label htmlFor="aptoFisico" className="form-label">
          Certificado de aptitud física
        </label>
        <p style={{ fontSize: "0.8rem", color: "var(--color-gray)", marginBottom: 4 }}>
          Adjuntá el certificado emitido por tu médico (PDF, JPG, PNG).
        </p>
        <input
          id="aptoFisico"
          name="aptoFisico"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          className="form-input"
        />
        {state.errores?.aptoFisico && (
          <span className="form-error">⚠ {state.errores.aptoFisico[0]}</span>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        id="btn-submit-registro"
        className="btn-primary"
        disabled={isPending}
        style={{
          marginTop: 8,
          padding: "14px",
          fontSize: "1rem",
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {isPending ? "Registrando..." : "Crear cuenta"}
      </button>
    </form>
  );
}
