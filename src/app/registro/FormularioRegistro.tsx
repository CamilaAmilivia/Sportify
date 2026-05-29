"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { registrarCliente, RegistroState } from "./actions";

const estadoInicial: RegistroState = {};

export default function FormularioRegistro() {
  const [state, action, isPending] = useActionState(
    registrarCliente,
    estadoInicial
  );
  const [nombreArchivo, setNombreArchivo] = useState<string | null>(null);
  const [mostrarPassword, setMostrarPassword] = useState(false);

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
          defaultValue={state.valores?.dni ?? ""}
          required
          maxLength={8}
          onKeyDown={(e) => {
            if (
              e.ctrlKey ||
              e.metaKey ||
              e.key.length > 1
            ) {
              return;
            }
            if (!/^[0-9]$/.test(e.key)) {
              e.preventDefault();
              return;
            }
            const target = e.target as HTMLInputElement;
            if (e.key === "0" && target.value.length === 0) {
              e.preventDefault();
            }
          }}
          onChange={(e) => {
            let val = e.target.value.replace(/[^0-9]/g, "");
            if (val.startsWith("0")) val = val.replace(/^0+/, "");
            if (val.length > 8) val = val.slice(0, 8);
            e.target.value = val;
          }}
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
            defaultValue={state.valores?.nombre ?? ""}
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
            defaultValue={state.valores?.apellido ?? ""}
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
          defaultValue={state.valores?.email ?? ""}
          required
        />
        {state.errores?.email && (
          <span className="form-error">⚠ {state.errores.email[0]}</span>
        )}
      </div>

      {/* Contraseña — se vacía intencionalmente por seguridad */}
      <div className="form-field">
        <label htmlFor="password" className="form-label">
          Contraseña
        </label>
        <div style={{ position: "relative" }}>
          <input
            id="password"
            name="password"
            type={mostrarPassword ? "text" : "password"}
            placeholder="Mínimo 6 caracteres"
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
              fontSize: "1.1rem",
              color: "var(--color-gray)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {mostrarPassword ? (
              // Ojo abierto
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            ) : (
              // Ojo tachado
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

      {/* Fecha de nacimiento */}
      <div className="form-field">
        <label htmlFor="fechaNac" className="form-label">
          Fecha de nacimiento
        </label>
        <input
          id="fechaNac"
          name="fechaNac"
          type="date"
          lang="es-AR"
          className="form-input"
          defaultValue={state.valores?.fechaNac ?? ""}
          required
        />
        {state.errores?.fechaNac && (
          <span className="form-error">⚠ {state.errores.fechaNac[0]}</span>
        )}
      </div>

      {/* Apto físico */}
      <div className="form-field">
        <label className="form-label">
          Certificado de aptitud física
        </label>
        <p style={{ fontSize: "0.8rem", color: "var(--color-gray)", marginBottom: 4 }}>
          Adjuntá el certificado emitido por tu médico (PDF, JPG, PNG).
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
          <label
            htmlFor="aptoFisico"
            style={{
              padding: "9px 16px",
              background: "var(--color-gray-light)",
              border: "1.5px solid #D1D5DB",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "var(--color-dark)",
              transition: "all var(--transition)",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = "var(--color-green)";
              e.currentTarget.style.background = "var(--color-white)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = "#D1D5DB";
              e.currentTarget.style.background = "var(--color-gray-light)";
            }}
          >
            📁 Seleccionar archivo
          </label>
          <span
            style={{
              fontSize: "0.9rem",
              color: nombreArchivo ? "var(--color-dark)" : "var(--color-gray)",
              fontWeight: nombreArchivo ? 500 : 400,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "220px",
            }}
            title={nombreArchivo || "Ningún archivo seleccionado"}
          >
            {nombreArchivo ? nombreArchivo : "Ningún archivo seleccionado"}
          </span>
        </div>
        <input
          id="aptoFisico"
          name="aptoFisico"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              setNombreArchivo(e.target.files[0].name);
            } else {
              setNombreArchivo(null);
            }
          }}
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
