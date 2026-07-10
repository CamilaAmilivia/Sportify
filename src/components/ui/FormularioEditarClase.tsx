"use client";

import { useState, useEffect } from "react";
import { editarClase } from "@/app/plataforma/clases/actions";

type FormularioEditarClaseProps = {
  clase: {
    id: number;
    titulo: string;
    fechaHora: Date | string;
    duracionMin: number;
    disciplina: { nombre: string };
    profesor: { nombre: string; apellido: string };
    disciplinaId?: number; // fallback
    profesorId?: number;  // fallback
    cupoMaximo?: number;
    precio?: number;
  };
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

export function FormularioEditarClase({
  clase,
  disciplinas,
  profesores,
  onClose,
  onSuccess,
}: FormularioEditarClaseProps) {
  const [cargando, setCargando] = useState(false);
  const [errores, setErrores] = useState<any>({});
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  // Obtener fecha y hora iniciales
  const fechaObjeto = new Date(clase.fechaHora);
  const y = fechaObjeto.getFullYear();
  const m = String(fechaObjeto.getMonth() + 1).padStart(2, "0");
  const d = String(fechaObjeto.getDate()).padStart(2, "0");
  const fechaInicialStr = `${y}-${m}-${d}`;
  
  const horaInicialStr = fechaObjeto.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Intentar encontrar los IDs del profesor y disciplina correspondientes
  const profesorInicial = profesores.find(
    (p) => p.nombre === clase.profesor.nombre && p.apellido === clase.profesor.apellido
  );
  const disciplinaInicial = disciplinas.find(
    (disp) => disp.nombre === clase.disciplina.nombre
  );

  const [formData, setFormData] = useState({
    titulo: clase.titulo,
    profesorId: profesorInicial?.id || (clase as any).profesorId || "",
    disciplinaId: disciplinaInicial?.id || (clase as any).disciplinaId || disciplinas[0]?.id || "",
    fecha: fechaInicialStr,
    hora: horaInicialStr,
    cupoMaximo: (clase as any).cupoMaximo || 20,
    precio: (clase as any).precio !== undefined ? (clase as any).precio : "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (mensajeExito) setMensajeExito(null);
    const { name, value } = e.target;

    let finalValue: string | number = value;
    if (name === "disciplinaId" || name === "profesorId" || name === "cupoMaximo" || name === "precio") {
      finalValue = value === "" ? "" : parseFloat(value);
    } else if (name === "hora") {
      const soloDigitos = value.replace(/[^\d]/g, "");
      if (soloDigitos.length <= 4) {
        finalValue = soloDigitos;
        if (soloDigitos.length >= 3) {
          finalValue = soloDigitos.slice(0, 2) + ":" + soloDigitos.slice(2);
        }
      } else {
        return;
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCargando(true);
    setErrores({});

    // Combinar fecha y hora en formato ISO
    let fechaHoraIso = "";
    try {
      const [h, min] = formData.hora.split(":").map(Number);
      const [y, m, d] = formData.fecha.split("-").map(Number);
      const date = new Date(y, m - 1, d, h, min, 0, 0);
      fechaHoraIso = date.toISOString();
    } catch (err) {
      setErrores({ general: ["La fecha u hora ingresada no es válida."] });
      setCargando(false);
      return;
    }

    const datosAEnviar = {
      titulo: formData.titulo,
      profesorId: Number(formData.profesorId),
      fechaHora: fechaHoraIso,
      disciplinaId: Number(formData.disciplinaId),
      cupoMaximo: Number(formData.cupoMaximo),
      precio: Number(formData.precio) || 0,
    };

    const result = await editarClase(clase.id, datosAEnviar);

    if (result.success) {
      setMensajeExito(`Se modificó la clase exitosamente.`);
      setCargando(false);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else if (result.errores) {
      setErrores(result.errores);
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
          Editar clase
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
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)" }}>
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
                width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box"
              }}
            />
            {errores.titulo && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.titulo[0]}</span>}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)" }}>
              Profesor *
            </label>
            <select
              name="profesorId"
              value={formData.profesorId}
              onChange={handleChange}
              required
              style={{
                width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box"
              }}
            >
              <option value="">Seleccionar profesor</option>
              {profesores.map((profesor) => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre} {profesor.apellido} (DNI: {profesor.dni})
                </option>
              ))}
            </select>
            {errores.profesorId && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.profesorId[0]}</span>}
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)" }}>
              Disciplina *
            </label>
            <select
              name="disciplinaId"
              value={formData.disciplinaId}
              onChange={handleChange}
              style={{
                width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box"
              }}
            >
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
            {errores.disciplinaId && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.disciplinaId[0]}</span>}
          </div>

          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 16px 0", color: "var(--color-dark)" }}>Fecha y horario</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)" }}>
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "0.95rem", boxSizing: "border-box"
                }}
              />
              {errores.fechaHora && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.fechaHora[0]}</span>}
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)", fontSize: "0.95rem" }}>
                Hora inicio *
              </label>
              <input
                type="text"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                placeholder="HH:MM"
                maxLength={5}
                pattern="^([01]\d|2[0-3]):([0-5]\d)$"
                title="Formato de 24 horas (ej. 14:30)"
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box" }}
              />
              {errores.horaInicio && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.horaInicio[0]}</span>}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)", fontSize: "0.95rem" }}>
                Cupo máximo *
              </label>
              <input
                type="number"
                name="cupoMaximo"
                value={formData.cupoMaximo}
                onChange={handleChange}
                min="1"
                required
                style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box" }}
              />
              {errores.cupoMaximo && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.cupoMaximo[0]}</span>}
            </div>

            <div>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)", fontSize: "0.95rem" }}>
                Precio
              </label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--color-gray)", fontSize: "1rem" }}>$</span>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  min="1"
                  step="0.01"
                  required
                  style={{ width: "100%", padding: "10px 12px 10px 28px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box" }}
                />
              </div>
              {errores.precio && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.precio[0]}</span>}
            </div>
          </div>

          <div style={{ position: "relative" }}>
            {mensajeExito && (
              <div
                style={{
                  background: "#dcfce7",
                  color: "#166534",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  marginBottom: 12,
                }}
              >
                {mensajeExito}
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 8 }}>
              <button
                type="button"
                onClick={onClose}
                disabled={cargando}
                style={{
                  padding: "12px 16px", border: "1px solid rgba(0,0,0,0.2)", borderRadius: 8, background: "white", color: "var(--color-dark)", fontWeight: 600, cursor: "pointer", opacity: cargando ? 0.6 : 1
                }}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={cargando}
                style={{
                  padding: "12px 16px", border: "none", borderRadius: 8, background: "#1d4ed8", color: "white", fontWeight: 600, cursor: cargando ? "not-allowed" : "pointer", opacity: cargando ? 0.7 : 1
                }}
              >
                {cargando ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
