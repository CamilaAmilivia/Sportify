"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { obtenerInscriptosClase } from "@/app/plataforma/clases/actions";

type Inscripto = {
  id: number;
  nombre: string;
  dni: number;
  presente: boolean | null;
};

export function GeneradorQR({
  claseId,
  claseTerminada,
}: {
  claseId: number;
  claseTerminada: boolean;
}) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inscriptos, setInscriptos] = useState<Inscripto[]>([]);
  const [cargandoInscriptos, setCargandoInscriptos] = useState(true);

  // 1. Efecto para inicializar el estado del QR y reportar que la pantalla está activa
  useEffect(() => {
    async function inicializarAsistencia() {
      try {
        // Obtener el token estático
        const resToken = await fetch(`/api/asistencia/token?claseId=${claseId}`);
        const dataToken = await resToken.json();

        if (!resToken.ok) {
          setError(dataToken.error || "Error al obtener el código QR");
          return;
        }

        setToken(dataToken.token);

        // Avisar al backend que la pestaña está abierta
        await fetch("/api/asistencia/estado", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ claseId, activo: true }),
        });

      } catch (err) {
        console.error(err);
        setError("Error de conexión");
      }
    }

    inicializarAsistencia();

    // Función para cerrar la asistencia
    const cerrarAsistencia = () => {
      const blob = new Blob([JSON.stringify({ claseId, activo: false })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/asistencia/estado", blob);
    };

    // Al desmontar el componente (ej. volver atrás)
    return () => cerrarAsistencia();
  }, [claseId]);

  // Al cerrar la pestaña o recargar
  useEffect(() => {
    const handleBeforeUnload = () => {
      const blob = new Blob([JSON.stringify({ claseId, activo: false })], {
        type: "application/json",
      });
      navigator.sendBeacon("/api/asistencia/estado", blob);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [claseId]);

  // 2. Polling de inscriptos en tiempo real cada 3 segundos
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    async function fetchInscriptos() {
      try {
        const datos = await obtenerInscriptosClase(claseId);
        setInscriptos(datos);
      } catch (err) {
        console.error("Error obteniendo inscriptos:", err);
      } finally {
        setCargandoInscriptos(false);
      }
    }

    fetchInscriptos();
    intervalId = setInterval(fetchInscriptos, 3000);

    return () => clearInterval(intervalId);
  }, [claseId]);

  if (error) {
    return (
      <div style={{ color: "#dc2626", background: "#fef2f2", padding: 16, borderRadius: 8, border: "1px solid #fecaca" }}>
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!token) {
    return <div style={{ color: "#6b7280" }}>Iniciando toma de asistencia...</div>;
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const scanUrl = `${origin}/plataforma/escanear?token=${token}`;

  return (
    <div className="flex flex-col lg:flex-row gap-8 justify-center items-start w-full">
      {/* Contenedor Izquierdo / Superior: QR de asistencia */}
      <div className="flex flex-col items-center gap-6 w-full lg:w-auto lg:min-w-[348px] lg:sticky lg:top-6">
        <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
          <QRCodeSVG value={scanUrl} size={300} />
        </div>
        <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", maxWidth: 400 }}>
          Este código es válido <strong>únicamente mientras mantengas esta pantalla abierta</strong>.
        </p>
      </div>

      {/* Contenedor Derecho / Inferior: Tabla de Inscriptos */}
      <div className="flex-1 w-full bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden">
        <div style={{ padding: "20px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, color: "var(--color-dark)", fontSize: "1.25rem", fontWeight: 800 }}>
            Inscriptos a la clase
          </h3>
        </div>

        <div style={{ overflowX: "auto" }}>
          {cargandoInscriptos ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>
              Cargando inscriptos...
            </div>
          ) : inscriptos.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--color-gray)", fontWeight: 500 }}>
              No hay inscriptos para esta clase.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc", position: "sticky", top: 0, borderBottom: "1px solid rgba(0,0,0,0.06)", zIndex: 10 }}>
                <tr>
                  <th style={{ padding: "16px 24px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>Nombre</th>
                  <th style={{ padding: "16px 24px", textAlign: "left", color: "var(--color-dark)", fontWeight: "700" }}>DNI</th>
                  <th style={{ padding: "16px 24px", textAlign: "center", color: "var(--color-dark)", fontWeight: "700" }}>Asistencia</th>
                </tr>
              </thead>
              <tbody>
                {inscriptos.map((ins, i) => {
                  let badge = null;
                  if (ins.presente === true) {
                    badge = (
                      <span style={{ background: "#dcfce7", color: "#15803d", padding: "6px 10px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, border: "1px solid #bbf7d0" }}>
                        Presente
                      </span>
                    );
                  } else if (ins.presente === false || claseTerminada) {
                    badge = (
                      <span style={{ background: "#fee2e2", color: "#dc2626", padding: "6px 10px", borderRadius: 6, fontSize: "0.8rem", fontWeight: 700, border: "1px solid #fecaca" }}>
                        Ausente
                      </span>
                    );
                  } else {
                    badge = <span style={{ color: "var(--color-gray)", fontWeight: 700 }}>—</span>;
                  }

                  return (
                    <tr key={ins.id} style={{ borderBottom: i === inscriptos.length - 1 ? "none" : "1px solid rgba(0,0,0,0.06)" }}>
                      <td style={{ padding: "16px 24px", color: "var(--color-dark)", fontWeight: 600 }}>{ins.nombre}</td>
                      <td style={{ padding: "16px 24px", color: "var(--color-gray)" }}>{ins.dni}</td>
                      <td style={{ padding: "16px 24px", textAlign: "center" }}>{badge}</td>
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
