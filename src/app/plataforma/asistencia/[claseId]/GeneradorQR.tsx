"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

export function GeneradorQR({ claseId }: { claseId: number }) {
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function inicializarAsistencia() {
      try {
        // 1. Obtener el token estático
        const resToken = await fetch(`/api/asistencia/token?claseId=${claseId}`);
        const dataToken = await resToken.json();

        if (!resToken.ok) {
          setError(dataToken.error || "Error al obtener el código QR");
          return;
        }

        setToken(dataToken.token);

        // 2. Avisar al backend que la pestaña está abierta
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
      // Usamos sendBeacon porque es más confiable cuando la página se está cerrando
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
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      <div style={{ background: "white", padding: 24, borderRadius: 16, boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}>
        <QRCodeSVG value={scanUrl} size={300} />
      </div>
      <p style={{ color: "#6b7280", fontSize: 14, textAlign: "center", maxWidth: 400 }}>
        Este código es válido <strong>únicamente mientras mantengas esta pantalla abierta</strong>.
      </p>
    </div>
  );
}
