"use client";

import { useEffect, useState } from "react";
import { obtenerInscriptosClase } from "@/app/plataforma/clases/actions";

type Inscripto = {
  id: number;
  nombre: string;
  dni: number;
  presente: boolean | null;
};

type ModalInscriptosClaseProps = {
  claseId: number;
  claseTitulo: string;
  claseTerminada: boolean;
  onClose: () => void;
};

export function ModalInscriptosClase({ claseId, claseTitulo, claseTerminada, onClose }: ModalInscriptosClaseProps) {
  const [inscriptos, setInscriptos] = useState<Inscripto[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function fetchInscriptos() {
      try {
        const datos = await obtenerInscriptosClase(claseId);
        setInscriptos(datos);
      } catch (error) {
        console.error("Error obteniendo inscriptos:", error);
      } finally {
        setCargando(false);
      }
    }
    fetchInscriptos();
  }, [claseId]);

  return (
    <div
      role="dialog"
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
          maxWidth: 600,
          background: "white",
          borderRadius: 16,
          boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
        }}
      >
        <div style={{ padding: "24px 28px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "var(--color-dark)", fontSize: "1.25rem", fontWeight: 800 }}>
            Inscriptos a {claseTitulo}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              fontSize: "2rem",
              color: "var(--color-gray)",
              cursor: "pointer",
              lineHeight: 1,
              padding: "0 8px"
            }}
          >
            &times;
          </button>
        </div>

        <div style={{ padding: "0", overflowY: "auto", flex: 1 }}>
          {cargando ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>
              Cargando inscriptos...
            </div>
          ) : inscriptos.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>
              No hay inscriptos para esta clase.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc", position: "sticky", top: 0, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <tr>
                  <th style={{ padding: "16px 28px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Nombre</th>
                  <th style={{ padding: "16px 28px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>DNI</th>
                  <th style={{ padding: "16px 28px", textAlign: "center", color: "var(--color-dark)", fontWeight: "700" }}>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {inscriptos.map((ins, i) => {
                  let badge = null;
                  if (ins.presente === true) {
                    badge = <span style={{ background: "#dcfce7", color: "#15803d", padding: "6px 10px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, border: "1px solid #bbf7d0" }}>Presente</span>;
                  } else if (ins.presente === false || claseTerminada) {
                    badge = <span style={{ background: "#fee2e2", color: "#dc2626", padding: "6px 10px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, border: "1px solid #fecaca" }}>Ausente</span>;
                  } else {
                    badge = <span style={{ color: "var(--color-gray)", fontWeight: 700 }}>—</span>;
                  }

                  return (
                    <tr key={ins.id} style={{ borderBottom: i === inscriptos.length - 1 ? "none" : "1px solid rgba(0,0,0,0.06)" }}>
                      <td style={{ padding: "16px 28px", color: "var(--color-dark)", fontWeight: 600 }}>{ins.nombre}</td>
                      <td style={{ padding: "16px 28px", color: "var(--color-gray)" }}>{ins.dni}</td>
                      <td style={{ padding: "16px 28px", textAlign: "center" }}>{badge}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
