"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TituloPagina } from "@/components/ui/TituloPagina";
import { FormularioCrearClase } from "@/components/ui/FormularioCrearClase";
import { obtenerClasesFiltradas } from "@/app/plataforma/clases/actions";

type Clase = {
  id: number;
  titulo: string;
  fechaHora: Date | string;
  duracionMin: number;
  disciplina: { nombre: string };
  profesor: { nombre: string; apellido: string };
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

type VistaFiltro = "SEMANA_ACTUAL" | "SEMANA_PROXIMA" | "RANGO_FECHAS";

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
      } else {
        // RANGO_FECHAS
        if (!fechaInicioPersonalizada || !fechaFinPersonalizada) {
          setCargando(false);
          return;
        }
        // Use local dates accurately
        inicio = new Date(fechaInicioPersonalizada + "T00:00:00");
        fin = new Date(fechaFinPersonalizada + "T23:59:59");
      }
      
      const resultados = await obtenerClasesFiltradas(inicio.toISOString(), fin.toISOString());
      setClases(resultados as unknown as Clase[]);
    } catch (error) {
      console.error("Error obteniendo clases:", error);
    } finally {
      setCargando(false);
    }
  }, [vistaFiltro, fechaInicioPersonalizada, fechaFinPersonalizada]);

  useEffect(() => {
    fetchClases();
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
    
    const options: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    return `${inicio.toLocaleTimeString("es-AR", options)} - ${fin.toLocaleTimeString("es-AR", options)}`;
  };

  return (
    <>
      <TituloPagina
        titulo="Gestión de clases"
        descripcion="Desde acá el administrador va a poder crear, editar, cancelar y consultar clases."
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
          ➕ Crear nueva clase
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "var(--color-dark)" }}>Lista de clases</h2>
        <div style={{ height: "1px", background: "rgba(0,0,0,0.1)", flex: 1 }}></div>
      </div>

      <div style={{ background: "white", padding: "28px", borderRadius: "18px", marginBottom: "32px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, color: "var(--color-dark)", fontSize: "1.2rem", fontWeight: 700 }}>Filtros de vista</h3>
          <button
            type="button"
            onClick={fetchClases}
            style={{
              padding: "10px 16px",
              background: "#f8fafc",
              color: "var(--color-dark)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 8,
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
          >
            🔄 Refrescar lista
          </button>
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
              <option value="RANGO_FECHAS">Rango de fechas</option>
            </select>
          </div>

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
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "18px", border: "1px solid rgba(0,0,0,0.06)", boxShadow: "0 8px 24px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        {cargando ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>Cargando clases...</div>
        ) : clases.length === 0 ? (
          <div style={{ padding: "48px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>No hay clases para el período seleccionado.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
              <thead style={{ background: "#f8fafc", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <tr>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Disciplina</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Profesor</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Fecha</th>
                  <th style={{ padding: "16px 20px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Horario</th>
                </tr>
              </thead>
              <tbody>
                {clases.map((clase, index) => (
                  <tr key={clase.id} style={{ borderBottom: index === clases.length - 1 ? "none" : "1px solid rgba(0,0,0,0.06)" }}>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)" }}>
                      <div style={{ fontWeight: "700", fontSize: "1.05rem", marginBottom: "4px" }}>{clase.disciplina.nombre}</div>
                      <div style={{ fontSize: "0.875rem", color: "var(--color-gray)", fontWeight: 500 }}>{clase.titulo}</div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)", fontWeight: 500 }}>
                      {clase.profesor.nombre} {clase.profesor.apellido}
                    </td>
                    <td style={{ padding: "16px 20px", color: "var(--color-dark)", textTransform: "capitalize", fontWeight: 500 }}>
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
            router.refresh();
            fetchClases(); // Refrescar las clases del lado del cliente
          }}
        />
      )}
    </>
  );
}
