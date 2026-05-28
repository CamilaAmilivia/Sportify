"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registrarProfesor } from "@/app/plataforma/profesores/registrar/actions";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";

function BotonSubmit() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="btn-primary"
      disabled={pending}
      style={{
        opacity: pending ? 0.7 : 1,
        cursor: pending ? "not-allowed" : "pointer",
      }}
    >
      {pending ? "Registrando..." : "Registrar Profesor"}
    </button>
  );
}

export function FormularioRegistroProfesor() {
  const [state, formAction] = useActionState(registrarProfesor, {});
  const router = useRouter();

  useEffect(() => {
    if (state.exito) {
      // Redirigir al listado de profesores después de un par de segundos
      const timer = setTimeout(() => {
        router.push("/plataforma/profesores");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [state.exito, router]);

  return (
    <div
      style={{
        backgroundColor: "var(--color-white)",
        padding: "32px",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-card)",
        maxWidth: "600px",
      }}
    >
      {state.exito && (
        <div
          style={{
            backgroundColor: "var(--color-green-light)",
            color: "var(--color-green-dark)",
            padding: "16px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "24px",
            border: "1px solid var(--color-green)",
          }}
        >
          {state.mensaje}
          <p style={{ marginTop: "8px", fontSize: "0.875rem" }}>
            Serás redirigido en breve...
          </p>
        </div>
      )}

      {state.mensaje && !state.exito && (
        <div
          style={{
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            padding: "16px",
            borderRadius: "var(--radius-sm)",
            marginBottom: "24px",
            border: "1px solid #fecaca",
          }}
        >
          {state.mensaje}
        </div>
      )}

      <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div className="form-field">
            <label htmlFor="nombre" className="form-label">
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              className="form-input"
            />
            {state.errores?.nombre && <span className="form-error">{state.errores.nombre[0]}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="apellido" className="form-label">
              Apellido
            </label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              required
              className="form-input"
            />
            {state.errores?.apellido && <span className="form-error">{state.errores.apellido[0]}</span>}
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="dni" className="form-label">
            DNI (Sin puntos)
          </label>
          <input
            type="text"
            id="dni"
            name="dni"
            required
            className="form-input"
          />
          <span style={{ fontSize: "0.8rem", color: "var(--color-gray)" }}>
            El DNI se utilizará como la contraseña temporal del profesor.
          </span>
          {state.errores?.dni && <span className="form-error">{state.errores.dni[0]}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="email" className="form-label">
            Correo Electrónico
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="form-input"
          />
          {state.errores?.email && <span className="form-error">{state.errores.email[0]}</span>}
        </div>

        <div className="form-field">
          <label htmlFor="fechaNac" className="form-label">
            Fecha de Nacimiento
          </label>
          <input
            type="date"
            id="fechaNac"
            name="fechaNac"
            required
            className="form-input"
          />
          {state.errores?.fechaNac && <span className="form-error">{state.errores.fechaNac[0]}</span>}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px" }}>
          <Link 
            href="/plataforma/profesores" 
            className="btn-outline"
          >
            Cancelar
          </Link>
          <BotonSubmit />
        </div>
      </form>
    </div>
  );
}
