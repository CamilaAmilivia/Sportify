"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { FormularioCrearClase } from "@/components/ui/FormularioCrearClase";
import { FormularioEditarClase } from "@/components/ui/FormularioEditarClase";
import { eliminarClasesSimilares, obtenerClasesFiltradas, suspenderClase } from "@/app/plataforma/clases/actions";
import { Toast } from "@/components/ui/Toast";

type Clase = {
  id: number;
  titulo: string;
  fechaHora: Date | string;
  duracionMin: number;
  estado: string;
  disciplina: { nombre: string };
  profesor: { id: number; nombre: string; apellido: string };
  serieId?: string | number | null;
  cupoMaximo?: number;
  precio?: number;
};

type GestionClasesProps = {
  disciplinas: Array<{ id: number; nombre: string }>;
  profesores: Array<{
    id: number;
    nombre: string;
    apellido: string;
    dni: number;
  }>;
};

type VistaFiltro = "SEMANA_ACTUAL" | "SEMANA_PROXIMA" | "RANGO_FECHAS" | "DIA_ESPECIFICO";

export function GestionClases({
  disciplinas,
  profesores,
}: GestionClasesProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [vistaFiltro, setVistaFiltro] = useState<VistaFiltro>("SEMANA_ACTUAL");
  
  const [fechaInicioPersonalizada, setFechaInicioPersonalizada] = useState<string>("");
  const [fechaFinPersonalizada, setFechaFinPersonalizada] = useState<string>("");
  
  const [clases, setClases] = useState<Clase[]>([]);
  const [cargando, setCargando] = useState(false);
  const [claseAEliminar, setClaseAEliminar] = useState<Clase | null>(null);
  const [eliminando, setEliminando] = useState(false);
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null);

  const [fechaFiltroEspecifica, setFechaFiltroEspecifica] = useState<string>("");

  const [filtroProfesorId, setFiltroProfesorId] = useState<number | "TODOS">("TODOS");
  const [busquedaProfesor, setBusquedaProfesor] = useState("");
  const [dropdownProfesorAbierto, setDropdownProfesorAbierto] = useState(false);

  const [claseASuspender, setClaseASuspender] = useState<Clase | null>(null);
  const [suspendiendo, setSuspendiendo] = useState(false);
  const [errorSuspender, setErrorSuspender] = useState<string | null>(null);

  const [claseAEditar, setClaseAEditar] = useState<Clase | null>(null);
  const [errorEnDialogo, setErrorEnDialogo] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ tipo: "success" | "error"; mensaje: string } | null>(null);

  const router = useRouter();

  const fetchClases = useCallback(async () => {
    setCargando(true);
    try {
      let inicio: Date;
      let fin: Date;
      
      const ahora = new Date();
      
      if (vistaFiltro === "SEMANA_ACTUAL") {
        // Lunes de la semana actual
        const diaSemana = ahora.getDay() === 0 ? 6 : ahora.getDay() - 1; // 0 es Domingo
        inicio = new Date(ahora);
        inicio.setDate(ahora.getDate() - diaSemana);
        inicio.setHours(0, 0, 0, 0);
        
        fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
      } else if (vistaFiltro === "SEMANA_PROXIMA") {
        const diaSemana = ahora.getDay() === 0 ? 6 : ahora.getDay() - 1;
        inicio = new Date(ahora);
        inicio.setDate(ahora.getDate() - diaSemana + 7);
        inicio.setHours(0, 0, 0, 0);
        
        fin = new Date(inicio);
        fin.setDate(inicio.getDate() + 6);
        fin.setHours(23, 59, 59, 999);
      } else if (vistaFiltro === "RANGO_FECHAS") {
        // RANGO_FECHAS
        if (!fechaInicioPersonalizada || !fechaFinPersonalizada) {
          setCargando(false);
          return;
        }
        // Use local dates accurately
        inicio = new Date(fechaInicioPersonalizada + "T00:00:00");
        fin = new Date(fechaFinPersonalizada + "T23:59:59");
      } else {
        // DIA_ESPECIFICO
        if (!fechaFiltroEspecifica) {
          setCargando(false);
          return;
        }
        inicio = new Date(fechaFiltroEspecifica + "T00:00:00");
        fin = new Date(fechaFiltroEspecifica + "T23:59:59");
      }
      
      const resultados = await obtenerClasesFiltradas(inicio.toISOString(), fin.toISOString());
      setClases(resultados as unknown as Clase[]);
    } catch (error) {
      console.error("Error obteniendo clases:", error);
    } finally {
      setCargando(false);
    }
  }, [vistaFiltro, fechaInicioPersonalizada, fechaFinPersonalizada, fechaFiltroEspecifica]);

  useEffect(() => {
    void Promise.resolve().then(fetchClases);
  }, [fetchClases]);

  const formatearFecha = (fechaString: Date | string) => {
    const fecha = new Date(fechaString);
    return fecha.toLocaleDateString("es-AR", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatearHorario = (fechaString: Date | string, duracion: number) => {
    const inicio = new Date(fechaString);
    const fin = new Date(inicio.getTime() + duracion * 60000);
    
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit', hour12: false };
    return `${inicio.toLocaleTimeString("es-AR", options)} a ${fin.toLocaleTimeString("es-AR", options)} h`;
  };

  const confirmarEliminacion = async () => {
    if (!claseAEliminar) return;

    setEliminando(true);
    setErrorEnDialogo(null);

    try {
      const resultado = await eliminarClasesSimilares(claseAEliminar.id);

      if (resultado.error) {
        setErrorEnDialogo(resultado.error);
        setToast({
          tipo: "error",
          mensaje: resultado.error,
        });
        return;
      }

      setToast({
        tipo: "success",
        mensaje: `Se eliminaron ${resultado.cantidadEliminadas} clase${resultado.cantidadEliminadas !== 1 ? "s" : ""} correctamente.`,
      });

      setClaseAEliminar(null);
      setErrorEnDialogo(null);
      router.refresh();
      await fetchClases();
    } catch (error) {
      console.error("Error eliminando clases:", error);
      const mensajeError = "No se pudo eliminar la clase. Intenta nuevamente.";
      setErrorEnDialogo(mensajeError);
      setToast({
        tipo: "error",
        mensaje: mensajeError,
      });
    } finally {
      setEliminando(false);
    }
  };

  const confirmarSuspension = async () => {
    if (!claseASuspender) return;

    setSuspendiendo(true);
    setErrorSuspender(null);

    try {
      const resultado = await suspenderClase(claseASuspender.id);

      if (resultado.error) {
        setErrorSuspender(resultado.error);
        return;
      }

      setClaseASuspender(null);
      setToast({ tipo: "success", mensaje: "La clase fue suspendida y se notificó a los inscriptos." });
      router.refresh();
      await fetchClases();
    } catch (error) {
      console.error("Error suspendiendo clase:", error);
      setErrorSuspender("No se pudo suspender la clase. Intenta nuevamente.");
    } finally {
      setSuspendiendo(false);
    }
  };

  const clasesFiltradasYDisponibles = clases.filter((clase) => {
    if (filtroProfesorId !== "TODOS" && clase.profesor.id !== filtroProfesorId) {
      return false;
    }
    return true;
  });

  return (
    <>
      <TituloPagina
        titulo="Gestión de clases"
      />

      <div style={{ marginBottom: "40px" }}>
        <button
          type="button"
          onClick={() => setMostrarFormulario(true)}
          style={{
            padding: "16px 24px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          ➕ Crear clase
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--color-dark)" }}>Lista de clases</h2>
        <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", flex: 1 }}></div>
      </div>

      <div style={{ background: "white", padding: "28px", borderRadius: "18px", marginBottom: "32px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
        <div style={{ marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "var(--color-dark)", fontSize: "1.2rem", fontWeight: 700 }}>Filtros de vista</h3>
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", alignItems: "flex-end" }}>
          <div>
            <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "8px", fontWeight: 600 }}>Período</label>
            <select
              value={vistaFiltro}
              onChange={(e) => setVistaFiltro(e.target.value as VistaFiltro)}
              style={{
                padding: "12px",
                background: "#f8fafc",
                color: "var(--color-dark)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                fontWeight: 500
              }}
            >
              <option value="SEMANA_ACTUAL">Semana actual</option>
              <option value="SEMANA_PROXIMA">Semana próxima</option>
              <option value="DIA_ESPECIFICO">Día específico</option>
              <option value="RANGO_FECHAS">Rango de fechas</option>
            </select>
          </div>

          {vistaFiltro === "DIA_ESPECIFICO" && (
            <div>
              <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "8px", fontWeight: 600 }}>Seleccionar día</label>
              <input
                type="date"
                value={fechaFiltroEspecifica}
                onChange={(e) => setFechaFiltroEspecifica(e.target.value)}
                style={{
                  padding: "11px",
                  background: "#f8fafc",
                  color: "var(--color-dark)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: "8px",
                  outline: "none",
                  fontWeight: 500
                }}
              />
            </div>
          )}

          {vistaFiltro === "RANGO_FECHAS" && (
            <>
              <div>
                <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "8px", fontWeight: 600 }}>Desde</label>
                <input
                  type="date"
                  value={fechaInicioPersonalizada}
                  onChange={(e) => setFechaInicioPersonalizada(e.target.value)}
                  style={{
                    padding: "11px",
                    background: "#f8fafc",
                    color: "var(--color-dark)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    outline: "none",
                    fontWeight: 500
                  }}
                />
              </div>
              <div>
                <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "8px", fontWeight: 600 }}>Hasta</label>
                <input
                  type="date"
                  value={fechaFinPersonalizada}
                  onChange={(e) => setFechaFinPersonalizada(e.target.value)}
                  style={{
                    padding: "11px",
                    background: "#f8fafc",
                    color: "var(--color-dark)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    outline: "none",
                    fontWeight: 500
                  }}
                />
              </div>
            </>
          )}

          <div style={{ position: "relative" }}>
            <label style={{ display: "block", color: "var(--color-gray)", fontSize: "0.875rem", marginBottom: "8px", fontWeight: 600 }}>Profesor</label>
            <div 
              onClick={() => setDropdownProfesorAbierto(!dropdownProfesorAbierto)}
              style={{
                padding: "12px",
                background: "#f8fafc",
                color: "var(--color-dark)",
                border: "1px solid rgba(0,0,0,0.1)",
                borderRadius: "8px",
                fontSize: "1rem",
                cursor: "pointer",
                fontWeight: 500,
                minWidth: "250px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>
                {filtroProfesorId === "TODOS" 
                  ? "Todos los profesores" 
                  : (() => {
                      const p = profesores.find(p => p.id === filtroProfesorId);
                      return p ? `${p.nombre} ${p.apellido} (DNI: ${p.dni})` : "Seleccionar profesor";
                    })()}
              </span>
              <span style={{ marginLeft: "8px", fontSize: "0.8rem" }}>▼</span>
            </div>
            
            {dropdownProfesorAbierto && (
              <>
                <div 
                  onClick={() => setDropdownProfesorAbierto(false)} 
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                />
                <div 
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    minWidth: "100%",
                    marginTop: "4px",
                    background: "white",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    zIndex: 50,
                    maxHeight: "300px",
                    overflowY: "auto"
                  }}
                >
                  <div style={{ padding: "8px", position: "sticky", top: 0, background: "white", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                    <input 
                      type="text" 
                      placeholder="Buscar profesor..." 
                      value={busquedaProfesor}
                      onChange={(e) => setBusquedaProfesor(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: "100%",
                        padding: "8px",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: "6px",
                        outline: "none",
                        fontSize: "0.9rem",
                        boxSizing: "border-box"
                      }}
                      autoFocus
                    />
                  </div>
                  <div 
                    onClick={() => {
                      setFiltroProfesorId("TODOS");
                      setDropdownProfesorAbierto(false);
                      setBusquedaProfesor("");
                    }}
                    style={{
                      padding: "10px 12px",
                      cursor: "pointer",
                      background: filtroProfesorId === "TODOS" ? "#f1f5f9" : "transparent",
                      fontSize: "0.95rem"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = filtroProfesorId === "TODOS" ? "#f1f5f9" : "transparent")}
                  >
                    Todos los profesores
                  </div>
                  {profesores
                    .filter(p => `${p.nombre} ${p.apellido} ${p.dni}`.toLowerCase().includes(busquedaProfesor.toLowerCase()))
                    .map(p => (
                      <div 
                        key={p.id}
                        onClick={() => {
                          setFiltroProfesorId(p.id);
                          setDropdownProfesorAbierto(false);
                          setBusquedaProfesor("");
                        }}
                        style={{
                          padding: "10px 12px",
                          cursor: "pointer",
                          background: filtroProfesorId === p.id ? "#f1f5f9" : "transparent",
                          fontSize: "0.95rem",
                          whiteSpace: "nowrap"
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f1f5f9")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = filtroProfesorId === p.id ? "#f1f5f9" : "transparent")}
                      >
                        {p.nombre} {p.apellido} (DNI: {p.dni})
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>

        </div>
      </div>

      <div style={{ background: "white", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {cargando ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>Cargando clases...</div>
        ) : clasesFiltradasYDisponibles.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>No hay clases para los filtros seleccionados.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <tr>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Disciplina</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Profesor</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Fecha</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Horario</th>
                  <th style={{ padding: "16px 20px", textAlign: "right", color: "var(--color-dark)", fontWeight: "700" }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {clasesFiltradasYDisponibles.map((clase, index) => (
                  <tr key={clase.id} style={{ borderBottom: index === clasesFiltradasYDisponibles.length - 1 ? "none" : "1px solid rgba(0,0,0,0.06)" }}>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)" }}>
                      <div style={{ fontWeight: "700", fontSize: "1.05rem", marginBottom: "4px" }}>
                        {clase.disciplina.nombre}
                        {clase.estado === "SUSPENDIDA" && (
                          <span style={{
                            marginLeft: "8px",
                            background: "#fff7ed",
                            color: "#c2410c",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 700
                          }}>
                            Suspendida
                          </span>
                        )}
                        {clase.estado === "CANCELADA" && (
                          <span style={{
                            marginLeft: "8px",
                            background: "#fee2e2",
                            color: "#dc2626",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 700
                          }}>
                            Cancelada
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "0.875rem", color: "var(--color-gray)", fontWeight: 500 }}>{clase.titulo}</div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)", fontWeight: 500 }}>
                      {clase.profesor.nombre} {clase.profesor.apellido}
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)", fontWeight: 500 }}>
                      {formatearFecha(clase.fechaHora)}
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)" }}>
                      <span style={{ 
                        background: "#f8fafc", 
                        padding: "8px 12px", 
                        borderRadius: "8px",
                        border: "1px solid rgba(0,0,0,0.06)",
                        fontSize: "0.875rem",
                        fontWeight: 600
                      }}>
                        {formatearHorario(clase.fechaHora, clase.duracionMin)}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setClaseAEditar(clase);
                        }}
                        style={{
                          padding: "10px 14px",
                          background: "#eff6ff",
                          color: "#1d4ed8",
                          border: "1px solid #bfdbfe",
                          borderRadius: 8,
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          marginRight: "8px",
                        }}
                      >
                        ✏️ Editar
                      </button>
                      <button
                        type="button"
                        disabled={clase.estado === "CANCELADA" || clase.estado === "SUSPENDIDA"}
                        onClick={() => {
                          setClaseASuspender(clase);
                          setErrorSuspender(null);
                        }}
                        style={{
                          padding: "10px 14px",
                          background: (clase.estado === "CANCELADA" || clase.estado === "SUSPENDIDA") ? "#f1f5f9" : "#fff7ed",
                          color: (clase.estado === "CANCELADA" || clase.estado === "SUSPENDIDA") ? "#94a3b8" : "#c2410c",
                          border: (clase.estado === "CANCELADA" || clase.estado === "SUSPENDIDA") ? "1px solid #e2e8f0" : "1px solid #ffedd5",
                          borderRadius: 8,
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          cursor: (clase.estado === "CANCELADA" || clase.estado === "SUSPENDIDA") ? "not-allowed" : "pointer",
                          marginRight: "8px",
                        }}
                      >
                        ⏸️ Suspender
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setClaseAEliminar(clase);
                          setToast(null);
                          setErrorEnDialogo(null);
                        }}
                        style={{
                          padding: "10px 14px",
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "1px solid #fecaca",
                          borderRadius: 8,
                          fontSize: "0.875rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {mostrarFormulario && (
        <FormularioCrearClase
          disciplinas={disciplinas}
          profesores={profesores}
          onClose={() => setMostrarFormulario(false)}
          onSuccess={() => {
            setMostrarFormulario(false);
            router.refresh();
            fetchClases(); // Refrescar las clases del lado del cliente
          }}
        />
      )}

      {claseAEditar && (
        <FormularioEditarClase
          clase={claseAEditar}
          disciplinas={disciplinas}
          profesores={profesores}
          onClose={() => setClaseAEditar(null)}
          onSuccess={() => {
            setClaseAEditar(null);
            router.refresh();
            fetchClases();
          }}
        />
      )}

      {claseAEliminar && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmar-eliminar-clase"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1001,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "white",
              borderRadius: 8,
              padding: "28px",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
            }}
          >
            <h3
              id="confirmar-eliminar-clase"
              style={{
                margin: "0 0 12px",
                color: "var(--color-dark)",
                fontSize: "1.25rem",
                fontWeight: 800,
              }}
            >
              {errorEnDialogo ? "No se puede eliminar" : "Eliminar clase"}
            </h3>
            <p style={{ margin: 0, color: "var(--color-gray)", lineHeight: 1.6, fontWeight: 500 }}>
              {errorEnDialogo 
                ? errorEnDialogo 
                : `Esta seguro que quiere eliminar esta clase? se borraran todas las instancias hasta 31/12/${new Date().getFullYear()}.`}
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              {!errorEnDialogo && (
                <button
                  type="button"
                  disabled={eliminando}
                  onClick={() => {
                    setClaseAEliminar(null);
                    setToast(null);
                    setErrorEnDialogo(null);
                  }}
                  style={{
                    padding: "12px 16px",
                    background: "#f8fafc",
                    color: "var(--color-dark)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    borderRadius: 8,
                    fontWeight: 700,
                    cursor: eliminando ? "not-allowed" : "pointer",
                  }}
                >
                  Cancelar
                </button>
              )}
              <button
                type="button"
                disabled={eliminando}
                onClick={() => {
                  if (errorEnDialogo) {
                    setClaseAEliminar(null);
                    setErrorEnDialogo(null);
                    setToast(null);
                  } else {
                    confirmarEliminacion();
                  }
                }}
                style={{
                  padding: "12px 16px",
                  background: errorEnDialogo 
                    ? "#0f766e"
                    : eliminando ? "#fca5a5" : "#dc2626",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: eliminando ? "not-allowed" : "pointer",
                }}
              >
                {errorEnDialogo 
                  ? "Cerrar"
                  : eliminando ? "Eliminando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {claseASuspender && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmar-suspender-clase"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1001,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 460,
              background: "white",
              borderRadius: 8,
              padding: "28px",
              boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
            }}
          >
            <h3
              id="confirmar-suspender-clase"
              style={{
                margin: "0 0 12px",
                color: "var(--color-dark)",
                fontSize: "1.25rem",
                fontWeight: 800,
              }}
            >
              Suspender clase
            </h3>
            <p style={{ margin: "0 0 16px", color: "var(--color-dark)", fontWeight: 600 }}>
              ¿Está seguro que quiere suspender esta clase? Se suspenderá la clase sólo para el día seleccionado.
            </p>
            <div style={{ background: "#fff7ed", padding: "16px", borderRadius: "8px", marginBottom: "16px", border: "1px solid #ffedd5", fontSize: "0.95rem" }}>
              <p style={{ margin: "0 0 8px" }}><strong>Clase:</strong> {claseASuspender.disciplina.nombre} ({claseASuspender.titulo})</p>
              <p style={{ margin: "0 0 8px" }}><strong>Profesor:</strong> {claseASuspender.profesor.nombre} {claseASuspender.profesor.apellido}</p>
              <p style={{ margin: "0 0 8px" }}><strong>Fecha:</strong> {formatearFecha(claseASuspender.fechaHora)}</p>
              <p style={{ margin: 0 }}><strong>Horario:</strong> {formatearHorario(claseASuspender.fechaHora, claseASuspender.duracionMin)}</p>
            </div>
            <p style={{ margin: 0, color: "var(--color-gray)", fontSize: "0.875rem", lineHeight: 1.5 }}>
              Se notificará al profesor y a los alumnos inscritos (los alumnos abonados recibirán un crédito gratis de clase, los no abonados recibirán su reintegro en efectivo).
            </p>

            {errorSuspender && (
              <p
                style={{
                  margin: "16px 0 0",
                  color: "#b91c1c",
                  background: "#fee2e2",
                  border: "1px solid #fecaca",
                  padding: "10px 12px",
                  borderRadius: 8,
                  fontWeight: 600,
                }}
              >
                {errorSuspender}
              </p>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
              <button
                type="button"
                disabled={suspendiendo}
                onClick={() => {
                  setClaseASuspender(null);
                  setErrorSuspender(null);
                }}
                style={{
                  padding: "12px 16px",
                  background: "#f8fafc",
                  color: "var(--color-dark)",
                  border: "1px solid rgba(0,0,0,0.1)",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: suspendiendo ? "not-allowed" : "pointer",
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={suspendiendo}
                onClick={confirmarSuspension}
                style={{
                  padding: "12px 16px",
                  background: suspendiendo ? "#fed7aa" : "#ea580c",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: suspendiendo ? "not-allowed" : "pointer",
                }}
              >
                {suspendiendo ? "Suspendiendo..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
      {toast && (
        <Toast
          tipo={toast.tipo}
          mensaje={toast.mensaje}
          duracion={8000}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
}
