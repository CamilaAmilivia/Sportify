"use client";

import { useState } from "react";
import { crearClase, CrearClaseErrores } from "@/app/plataforma/actions";

type FormularioCrearClaseProps = {
  disciplinas: Array<{ id: number; nombre: string }>;
  profesores: Array<{
    id: number;
    nombre: string;
    apellido: string;
    dni: number;
  }>;
  onClose: () => void;
  onSuccess: () => void;
};

export function FormularioCrearClase({
  disciplinas,
  profesores,
  onClose,
  onSuccess,
}: FormularioCrearClaseProps) {
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<CrearClaseErrores>({});
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    profesorId: "",
    fechaHora: "",
    horaInicio: "10:00",
    horaFin: "11:00",
    disciplinaId: disciplinas[0]?.id || 1,
    cupoMaximo: 20,
    precio: "" as unknown as number,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (mensajeExito) setMensajeExito(null);
    const { name, value } = e.target;

    // No validation for date needed, it uses type="date"
    if (name === "horaInicio" || name === "horaFin") {
      const soloDigitos = value.replace(/[^\d]/g, "");
      if (soloDigitos.length <= 4) {
        let formattedTime = soloDigitos;
        if (soloDigitos.length >= 3) {
          formattedTime = soloDigitos.slice(0, 2) + ":" + soloDigitos.slice(2);
        }
        setFormData((prev) => ({
          ...prev,
          [name]: formattedTime,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: name === "disciplinaId" || name === "profesorId" || name === "cupoMaximo" || name === "precio"
          ? parseFloat(value)
          : value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setErrores({});

    const result = await crearClase({
      ...formData,
      profesorId: Number(formData.profesorId),
    });

    if (result.success) {
      const partesFecha = formData.fechaHora.split("-");
      const fechaFormateada = partesFecha.length === 3 ? `${partesFecha[2]}/${partesFecha[1]}/${partesFecha[0]}` : formData.fechaHora;
      setMensajeExito(`Se creó la clase ${formData.titulo} para el ${fechaFormateada} en el horario ${formData.horaInicio} a ${formData.horaFin}`);
      onSuccess();
      setCargando(false);
    } else if (result.errores) {
      setErrores(result.errores as CrearClaseErrores);
      setCargando(false);
    } else if (result.error) {
      setErrores({ general: [result.error] });
      setCargando(false);
    }
  };

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
          Crear nueva clase
        </h2>

        {errores.general && (
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
            {errores.general[0]}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                fontWeight: 600,
                color: "var(--color-dark)",
              }}
            >
              Nombre de la clase *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Ej: Yoga Avanzado"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            {errores.titulo && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.titulo[0]}</span>
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
              Profesor *
            </label>
            <select
              name="profesorId"
              value={formData.profesorId}
              onChange={handleChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            >
              <option value="">Seleccionar profesor</option>

              {profesores.map((profesor) => (
                <option
                  key={profesor.id}
                  value={profesor.id}
                >
                  {profesor.nombre} {profesor.apellido} (DNI: {profesor.dni})
                </option>
              ))}
            </select>
            {errores.profesorId && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.profesorId[0]}</span>
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
              Disciplina *
            </label>
            <select
              name="disciplinaId"
              value={formData.disciplinaId}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            >
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombre}
                </option>
              ))}
            </select>
            {errores.disciplinaId && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.disciplinaId[0]}</span>
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
              Fecha *
            </label>
            <input
              type="date"
              name="fechaHora"
              value={formData.fechaHora}
              onChange={handleChange}
              lang="es-AR"
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: 8,
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            {errores.fechaHora && (
              <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.fechaHora[0]}</span>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "var(--color-dark)",
                  fontSize: "0.95rem",
                }}
              >
                Hora inicio *
              </label>
              <input
                type="text"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                placeholder="HH:MM"
                maxLength={5}
                pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                title="Formato de 24 horas (ej. 14:30)"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {errores.horaInicio && (
                <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.horaInicio[0]}</span>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "var(--color-dark)",
                  fontSize: "0.95rem",
                }}
              >
                Hora fin *
              </label>
              <input
                type="text"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                placeholder="HH:MM"
                maxLength={5}
                pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                title="Formato de 24 horas (ej. 14:30)"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {errores.horaFin && (
                <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.horaFin[0]}</span>
              )}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "var(--color-dark)",
                  fontSize: "0.95rem",
                }}
              >
                Cupo máximo *
              </label>
              <input
                type="number"
                name="cupoMaximo"
                value={formData.cupoMaximo}
                onChange={handleChange}
                min="1"
                required
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
              {errores.cupoMaximo && (
                <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.cupoMaximo[0]}</span>
              )}
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: 8,
                  fontWeight: 600,
                  color: "var(--color-dark)",
                  fontSize: "0.95rem",
                }}
              >
                Precio
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-gray)",
                    fontSize: "1rem",
                  }}
                >
                  $
                </span>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 28px",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 8,
                    fontSize: "1rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              {errores.precio && (
                <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.precio[0]}</span>
              )}
            </div>
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
              disabled={cargando}
              style={{
                padding: "12px 16px",
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: 8,
                background: "white",
                color: "var(--color-dark)",
                fontWeight: 600,
                cursor: "pointer",
                opacity: cargando ? 0.6 : 1,
              }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={cargando}
              style={{
                padding: "12px 16px",
                border: "none",
                borderRadius: 8,
                background: "#22c55e",
                color: "white",
                fontWeight: 600,
                cursor: cargando ? "not-allowed" : "pointer",
                opacity: cargando ? 0.7 : 1,
              }}
            >
              {cargando ? "Creando..." : "Confirmar"}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
