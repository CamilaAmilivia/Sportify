"use client";

import { useState, useEffect, useMemo } from "react";
import { editarClase, obtenerLimitesCupoClase } from "@/app/plataforma/clases/actions";

type FormularioEditarClaseProps = {
  clase: {
    id: number;
    titulo: string;
    fechaHora: Date | string;
    duracionMin: number;
    disciplina: { nombre: string };
    profesor: { nombre: string; apellido: string };
    disciplinaId?: number;
    profesorId?: number;
    cupoMaximo?: number;
    precio?: number;
    serieId?: string | number | null;
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
  const [cargandoLimites, setCargandoLimites] = useState(true);
  const [errores, setErrores] = useState<any>({});
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [aplicarAFuturas, setAplicarAFuturas] = useState(false);

  const [limites, setLimites] = useState({
    inscriptosActuales: 0,
    maximoPermitido: 30,
  });

  const profesorInicial = profesores.find(
    (p) => p.nombre === clase.profesor.nombre && p.apellido === clase.profesor.apellido
  );

  const [formData, setFormData] = useState({
    titulo: clase.titulo,
    profesorId: profesorInicial?.id || (clase as any).profesorId || "",
    cupoMaximo: (clase as any).cupoMaximo || 20,
  });

  // Cargar límites de cupo desde el servidor al montar
  useEffect(() => {
    let activo = true;
    obtenerLimitesCupoClase(clase.id)
      .then((res) => {
        if (!activo) return;
        setLimites({
          inscriptosActuales: res.inscriptosActuales,
          maximoPermitido: res.maximoPermitido,
        });
        // Asegurar que el cupo actual esté dentro de los límites
        const cupoClampeado = Math.max(
          res.inscriptosActuales,
          Math.min(res.maximoPermitido, (clase as any).cupoMaximo || 20)
        );
        setFormData((prev) => ({
          ...prev,
          cupoMaximo: cupoClampeado,
        }));
        setCargandoLimites(false);
      })
      .catch((err) => {
        if (!activo) return;
        console.error("Error al cargar límites de cupo:", err);
        setErrores({ general: ["No se pudieron cargar los límites de cupo de la clase."] });
        setCargandoLimites(false);
      });

    return () => {
      activo = false;
    };
  }, [clase.id, clase.cupoMaximo]);

  // Generar opciones de cupo desde el mínimo (inscriptos) hasta el máximo permitido
  const opcionesCupo = useMemo(() => {
    const list = [];
    const min = limites.inscriptosActuales;
    const max = limites.maximoPermitido;
    for (let i = min; i <= max; i++) {
      list.push(i);
    }
    return list;
  }, [limites.inscriptosActuales, limites.maximoPermitido]);

  // Formatear Fecha y Horario (Campos Estáticos)
  const formatearFecha = (fechaString: Date | string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatearHorario = (fechaString: Date | string, duracion: number) => {
    const inicio = new Date(fechaString);
    const fin = new Date(inicio.getTime() + duracion * 60000);
    const options: Intl.DateTimeFormatOptions = { hour: "2-digit", minute: "2-digit", hour12: false };
    return `${inicio.toLocaleTimeString("es-AR", options)} a ${fin.toLocaleTimeString("es-AR", options)} h`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (mensajeExito) setMensajeExito(null);
    const { name, value } = e.target;

    let finalValue: string | number = value;
    if (name === "profesorId" || name === "cupoMaximo") {
      finalValue = value === "" ? "" : parseInt(value, 10);
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
      cupoMaximo: Number(formData.cupoMaximo),
    };

    const result = await editarClase(clase.id, datosAEnviar, aplicarAFuturas);

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
          maxWidth: 520,
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

        {cargandoLimites ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--color-gray)", fontWeight: 600 }}>
            Cargando límites y cupos de la clase...
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>

            {/* CAMPOS NO EDITABLES (LECTURA) */}
            <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-gray)", fontWeight: 600 }}>Disciplina</span>
                <span style={{
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  padding: "4px 10px",
                  borderRadius: "6px",
                  fontSize: "0.875rem",
                  fontWeight: 700
                }}>
                  {clase.disciplina.nombre}
                </span>
              </div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "8px" }}>
                <p style={{ margin: "0 0 4px", fontSize: "0.85rem", color: "var(--color-gray)", fontWeight: 600 }}>Fecha y Horario</p>
                <p style={{ margin: "0 0 2px", fontSize: "0.95rem", color: "var(--color-dark)", fontWeight: 700 }}>
                  📅 {formatearFecha(clase.fechaHora)}
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem", color: "var(--color-dark)", fontWeight: 700 }}>
                  🕐 {formatearHorario(clase.fechaHora, clase.duracionMin)}
                </p>
              </div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--color-gray)", fontWeight: 600 }}>Precio</span>
                <span style={{ fontSize: "1rem", color: "var(--color-dark)", fontWeight: 800 }}>
                  ${(clase as any).precio || 0}
                </span>
              </div>
            </div>

            {/* CAMPOS EDITABLES */}
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
                Cupo máximo *
              </label>

              {opcionesCupo.length === 0 ? (
                <div style={{ color: "#dc2626", fontSize: "0.875rem", padding: "8px 0" }}>
                  ⚠ No hay opciones de cupo disponibles debido a superposiciones horarias.
                </div>
              ) : (
                <select
                  name="cupoMaximo"
                  value={formData.cupoMaximo}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%", padding: "10px 12px", border: "1px solid rgba(0,0,0,0.1)", borderRadius: 8, fontSize: "1rem", boxSizing: "border-box"
                  }}
                >
                  {opcionesCupo.map((num) => (
                    <option key={num} value={num}>
                      {num} {num === limites.inscriptosActuales ? "(Inscriptos actuales - Mínimo)" : num === limites.maximoPermitido ? "(Máximo permitido)" : ""}
                    </option>
                  ))}
                </select>
              )}

              <p style={{ fontSize: "0.825rem", color: "var(--color-gray)", margin: "6px 0 0" }}>
                Mínimo: {limites.inscriptosActuales} inscritos. Máximo: {limites.maximoPermitido} cupos (límite de 30 cupos en total).
              </p>
              {errores.cupoMaximo && <span style={{ display: "block", marginTop: 4, color: "#dc2626", fontSize: "0.875rem" }}>⚠ {errores.cupoMaximo[0]}</span>}
            </div>

            {clase.serieId && (
              <div style={{ padding: "14px", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: 12, marginTop: 8 }}>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 700, color: "#c2410c", fontSize: "0.95rem" }}>
                  <input
                    type="checkbox"
                    checked={aplicarAFuturas}
                    onChange={(e) => setAplicarAFuturas(e.target.checked)}
                    style={{ width: 18, height: 18, cursor: "pointer" }}
                  />
                  Aplicar cambios a clases futuras
                </label>
                <p style={{ margin: "4px 0 0 28px", fontSize: "0.825rem", color: "#c2410c", lineHeight: 1.4 }}>
                  ⚠️ Si se marca, se actualizarán todas las clases recurrentes de esta serie desde ésta en adelante.
                </p>
              </div>
            )}

            {/* BOTONES */}
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
                  disabled={cargando || opcionesCupo.length === 0}
                  style={{
                    padding: "12px 16px", border: "none", borderRadius: 8, background: "#1d4ed8", color: "white", fontWeight: 600, cursor: (cargando || opcionesCupo.length === 0) ? "not-allowed" : "pointer", opacity: (cargando || opcionesCupo.length === 0) ? 0.7 : 1
                  }}
                >
                  {cargando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
