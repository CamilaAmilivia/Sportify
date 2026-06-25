"use client";

import { useState, useEffect } from "react";
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

const diasSemana = [
  { valor: 1, nombre: "Lunes" },
  { valor: 2, nombre: "Martes" },
  { valor: 3, nombre: "Miércoles" },
  { valor: 4, nombre: "Jueves" },
  { valor: 5, nombre: "Viernes" },
  { valor: 6, nombre: "Sábado" },
  { valor: 0, nombre: "Domingo" },
];

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
    diaSemana: 3, // Miércoles por defecto
    personalizarInicio: false,
    fechaInicio: "",
    personalizarFin: false,
    fechaFin: "",
    horaInicio: "10:00",
    horaFin: "11:00",
    disciplinaId: disciplinas[0]?.id || 1,
    cupoMaximo: 20,
    precio: "" as unknown as number,
  });

  const getProximasFechas = (diaSemana: number) => {
    const fechas = [];
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    let diasParaProximo = diaSemana - hoy.getDay();
    if (diasParaProximo < 0) {
      diasParaProximo += 7;
    }

    const primeraFecha = new Date(hoy);
    primeraFecha.setDate(hoy.getDate() + diasParaProximo);

    for (let i = 0; i < 4; i++) {
      const fecha = new Date(primeraFecha);
      fecha.setDate(primeraFecha.getDate() + i * 7);
      fechas.push(fecha);
    }
    return fechas;
  };

  const proximasFechas = getProximasFechas(Number(formData.diaSemana));

  useEffect(() => {
    if (formData.personalizarInicio) {
      if (!formData.fechaInicio) {
        // Set to first option by default in format YYYY-MM-DD
        const [dia, mes, anio] = proximasFechas[0].toLocaleDateString("es-AR", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/");
        setFormData((prev) => ({ ...prev, fechaInicio: `${anio}-${mes}-${dia}` }));
      }
    } else {
      setFormData((prev) => ({ ...prev, fechaInicio: "" }));
    }
  }, [formData.personalizarInicio, formData.diaSemana]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (mensajeExito) setMensajeExito(null);
    const { name, value, type } = e.target as HTMLInputElement;

    let finalValue: any = value;
    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    } else if (name === "horaInicio" || name === "horaFin") {
      const soloDigitos = value.replace(/[^\d]/g, "");
      if (soloDigitos.length <= 4) {
        finalValue = soloDigitos;
        if (soloDigitos.length >= 3) {
          finalValue = soloDigitos.slice(0, 2) + ":" + soloDigitos.slice(2);
        }
      } else {
        return; // Don't update if it exceeds 4 digits
      }
    } else if (name === "disciplinaId" || name === "profesorId" || name === "cupoMaximo" || name === "precio" || name === "diaSemana") {
      finalValue = parseFloat(value);
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

    const datosAEnviar = {
      titulo: formData.titulo,
      profesorId: Number(formData.profesorId),
      diaSemana: Number(formData.diaSemana),
      fechaInicio: formData.personalizarInicio ? formData.fechaInicio : undefined,
      fechaFin: formData.personalizarFin ? formData.fechaFin : undefined,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      disciplinaId: Number(formData.disciplinaId),
      cupoMaximo: Number(formData.cupoMaximo),
      precio: Number(formData.precio) || undefined,
    };

    const result = await crearClase(datosAEnviar);

    if (result.success) {
      setMensajeExito(`Se creó la serie de clases ${formData.titulo} exitosamente para el horario ${formData.horaInicio} a ${formData.horaFin}.`);
      setCargando(false);
      setTimeout(() => {
        onSuccess();
      }, 2000);
    } else if (result.errores) {
      setErrores(result.errores as CrearClaseErrores);
      setCargando(false);
    } else if (result.error) {
      setErrores({ general: [result.error] });
      setCargando(false);
    }
  };

  const calcularUltimaClase = () => {
    if (!formData.fechaFin) return null;
    const fin = new Date(formData.fechaFin + "T00:00:00");
    const diaFin = fin.getDay();
    let diasAtras = diaFin - Number(formData.diaSemana);
    if (diasAtras < 0) diasAtras += 7;
    const ultima = new Date(fin);
    ultima.setDate(fin.getDate() - diasAtras);

    return ultima.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const ultimaClase = calcularUltimaClase();

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
          Crear serie de clases
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
            {errores.titulo && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.titulo[0]}</span>}
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
            {errores.profesorId && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.profesorId[0]}</span>}
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
            {errores.disciplinaId && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.disciplinaId[0]}</span>}
          </div>

          <div style={{ padding: "16px", background: "#f8fafc", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)" }}>
            <h3 style={{ fontSize: "1.1rem", margin: "0 0 16px 0", color: "var(--color-dark)" }}>Frecuencia y horario</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)" }}>
                Día de la semana *
              </label>
              <select
                name="diaSemana"
                value={formData.diaSemana}
                onChange={handleChange}
                required
                style={{
                  width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box"
                }}
              >
                {diasSemana.map((dia) => (
                  <option key={dia.valor} value={dia.valor}>{dia.nombre}</option>
                ))}
              </select>
              {errores.diaSemana && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.diaSemana[0]}</span>}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, color: "var(--color-dark)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="personalizarInicio"
                  checked={formData.personalizarInicio}
                  onChange={handleChange}
                  style={{ width: "16px", height: "16px" }}
                />
                Personalizar inicio de clases
              </label>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray)", margin: "4px 0 0 24px" }}>
                Por defecto, la serie comenzará el próximo {diasSemana.find(d => d.valor === Number(formData.diaSemana))?.nombre.toLowerCase()}.
              </p>

              {formData.personalizarInicio && (
                <div style={{ marginTop: 12, marginLeft: 24 }}>
                  <select
                    name="fechaInicio"
                    value={formData.fechaInicio}
                    onChange={handleChange}
                    required
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "0.95rem", boxSizing: "border-box"
                    }}
                  >
                    {proximasFechas.map((fecha, idx) => {
                      const [dia, mes, anio] = fecha.toLocaleDateString("es-AR", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/");
                      const dateStr = `${anio}-${mes}-${dia}`;
                      return (
                        <option key={dateStr} value={dateStr}>
                          {fecha.toLocaleDateString("es-AR", { weekday: 'long', day: 'numeric', month: 'long' })}
                        </option>
                      );
                    })}
                  </select>
                  {errores.fechaInicio && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.fechaInicio[0]}</span>}
                </div>
              )}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500, color: "var(--color-dark)", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="personalizarFin"
                  checked={formData.personalizarFin}
                  onChange={handleChange}
                  style={{ width: "16px", height: "16px" }}
                />
                Personalizar fin de clases
              </label>
              <p style={{ fontSize: "0.85rem", color: "var(--color-gray)", margin: "4px 0 0 24px" }}>
                Por defecto, se repetirán hasta el 31 de diciembre del año actual.
              </p>

              {formData.personalizarFin && (
                <div style={{ marginTop: 12, marginLeft: 24 }}>
                  <input
                    type="date"
                    name="fechaFin"
                    value={formData.fechaFin}
                    onChange={handleChange}
                    required
                    min={formData.personalizarInicio && formData.fechaInicio ? formData.fechaInicio : proximasFechas[0].toLocaleDateString("es-AR", { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-")}
                    max={`${new Date().getFullYear() + (new Date().getMonth() === 11 ? 1 : 0)}-12-31`}
                    style={{
                      width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "0.95rem", boxSizing: "border-box"
                    }}
                  />
                  {ultimaClase && (
                    <div style={{ marginTop: 8, padding: 8, background: "#e0f2fe", color: "#0369a1", borderRadius: 6, fontSize: "0.85rem", fontWeight: 500 }}>
                      ℹ️ La última clase será el {ultimaClase}.
                    </div>
                  )}
                  {errores.fechaFin && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.fechaFin[0]}</span>}
                </div>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)", fontSize: "0.95rem" }}>
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
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box" }}
                />
                {errores.horaInicio && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.horaInicio[0]}</span>}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 8, fontWeight: 600, color: "var(--color-dark)", fontSize: "0.95rem" }}>
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
                  style={{ width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box" }}
                />
                {errores.horaFin && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.horaFin[0]}</span>}
              </div>
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
              {errores.cupoMaximo && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.cupoMaximo[0]}</span>}
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
              {errores.precio && <span className="form-error" style={{ display: "block", marginTop: 4 }}>⚠ {errores.precio[0]}</span>}
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
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <span
                  style={{
                    width: 16,
                    height: 16,
                    marginTop: 2,
                    flexShrink: 0,
                    borderRadius: "50%",
                    border: "2px solid #bbf7d0",
                    borderTopColor: "#166534",
                    animation: "girar-spinner 0.7s linear infinite",
                  }}
                />
                <style>{`
                  @keyframes girar-spinner {
                    to { transform: rotate(360deg); }
                  }
                `}</style>
                <span>{mensajeExito}</span>
                <button
                  type="button"
                  onClick={() => setMensajeExito(null)}
                  style={{
                    position: "absolute", top: "4px", right: "4px", background: "transparent", border: "none", color: "#166534", cursor: "pointer", padding: "4px", lineHeight: 1, fontSize: "1.2rem", display: "flex", alignItems: "center", justifyContent: "center"
                  }}
                >
                  ×
                </button>
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
                  padding: "12px 16px", border: "none", borderRadius: 8, background: "#22c55e", color: "white", fontWeight: 600, cursor: cargando ? "not-allowed" : "pointer", opacity: cargando ? 0.7 : 1
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
