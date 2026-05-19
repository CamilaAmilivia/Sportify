"use client";

import { useState } from "react";
import { crearClase } from "@/app/plataforma/actions";

type FormularioCrearClaseProps = {
  disciplinas: Array<{ id: number; nombre: string }>;
  onClose: () => void;
  onSuccess: () => void;
};

export function FormularioCrearClase({
  disciplinas,
  onClose,
  onSuccess,
}: FormularioCrearClaseProps) {
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titulo: "",
    profesor: "",
    fechaHora: "",
    horaInicio: "10:00",
    horaFin: "11:00",
    disciplinaId: disciplinas[0]?.id || 1,
    cupoMaximo: 20,
    precio: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "disciplinaId" || name === "cupoMaximo" || name === "precio" 
        ? parseFloat(value) 
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setError(null);

    const result = await crearClase(formData);

    if (result.error) {
      setError(result.error);
      setCargando(false);
    } else {
      onSuccess();
      onClose();
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
      onClick={onClose}
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
          Crear Nueva Clase
        </h2>

        {error && (
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
            {error}
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
            <input
              type="text"
              name="profesor"
              value={formData.profesor}
              onChange={handleChange}
              placeholder="Nombre del profesor"
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
                type="time"
                name="horaInicio"
                value={formData.horaInicio}
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
              />
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
                type="time"
                name="horaFin"
                value={formData.horaFin}
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
              />
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
              <input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                min="0"
                step="0.01"
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

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
        </form>
      </div>
    </div>
  );
}
