"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { registrarProfesor } from "@/app/plataforma/profesores/actions";
import { useEffect } from "react";

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
      {pending ? "Registrando..." : "Confirmar"}
    </button>
  );
}

export function FormularioRegistroProfesor({
  onClose,
}: {
  onClose: () => void;
}) {
  const [state, formAction] = useActionState(registrarProfesor, {});
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    fechaNac: "",
  });

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (mensajeExito) setMensajeExito(null);
    let value = e.target.value;
    if (e.target.name === "dni") {
      value = value.replace(/[^0-9]/g, "");
      if (value.startsWith("0")) value = value.replace(/^0+/, "");
      if (value.length > 8) value = value.slice(0, 8);
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  useEffect(() => {
    if (state.exito) {
      setMensajeExito(`Se registró el profesor ${formData.nombre} ${formData.apellido} (DNI: ${formData.dni})`);
      setFormData({
        nombre: "",
        apellido: "",
        dni: "",
        email: "",
        fechaNac: "",
      });
    }
  }, [state]);

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
          maxWidth: 500,
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            fontSize: "1.6rem",
            fontWeight: 800,
            color: "var(--color-dark)",
            marginBottom: 24,
          }}
        >
          Registrar profesor
        </h2>

        {state.mensaje && !state.exito && (
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
            {state.mensaje}
          </div>
        )}

        <form action={formAction} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "var(--color-dark)",
                }}
              >
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {state.errores?.nombre && (
                <span className="form-error" style={{ display: "block", marginTop: 4 }}>
                  ⚠ {state.errores.nombre[0]}
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
                Apellido *
              </label>
              <input
                type="text"
                name="apellido"
                required
                value={formData.apellido}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {state.errores?.apellido && (
                <span className="form-error" style={{ display: "block", marginTop: 4 }}>
                  ⚠ {state.errores.apellido[0]}
                </span>
              )}
            </div>
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
              DNI *
            </label>
            <input
              type="text"
              name="dni"
              required
              value={formData.dni}
              onChange={handleChange}
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
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            {state.errores?.dni && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>
                ⚠ {state.errores.dni[0]}
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
              Correo electrónico *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            {state.errores?.email && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>
                ⚠ {state.errores.email[0]}
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
              Fecha de nacimiento *
            </label>
            <input
              type="date"
              name="fechaNac"
              lang="es-AR"
              required
              max={new Date().toISOString().split('T')[0]}
              value={formData.fechaNac}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            {state.errores?.fechaNac && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>
                ⚠ {state.errores.fechaNac[0]}
              </span>
            )}
          </div>

          <div style={{ position: "relative" }}>
            {mensajeExito && (
              <div
                style={{
                  position: "absolute",
                  bottom: "100%",
                  right: 0,
                  marginBottom: "12px",
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "12px 32px 12px 16px",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  zIndex: 10,
                  width: "max-content",
                  maxWidth: "100%",
                  lineHeight: 1.4,
                  textAlign: "left",
                }}
              >
                {mensajeExito}
                <button
                  type="button"
                  onClick={() => setMensajeExito(null)}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "4px",
                    background: "transparent",
                    border: "none",
                    color: "#166534",
                    cursor: "pointer",
                    padding: "4px",
                    lineHeight: 1,
                    fontSize: "1.2rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
                <div
                  style={{
                    position: "absolute",
                    bottom: "-6px",
                    right: "25%",
                    width: "12px",
                    height: "12px",
                    background: "#dcfce7",
                    borderBottom: "1px solid #bbf7d0",
                    borderRight: "1px solid #bbf7d0",
                    transform: "rotate(45deg)",
                  }}
                />
              </div>
            )}
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
          </div>
        </form>
      </div>
    </div>
  );
}
