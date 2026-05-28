"use client";

import { useRouter } from "next/navigation";

export function BotonAsistencia({
  claseId,
  inicioVentana,
  finVentana,
}: {
  claseId: number;
  inicioVentana: string;
  finVentana: string;
}) {
  const router = useRouter();
  const ahora = new Date();
  const inicio = new Date(inicioVentana);
  const fin = new Date(finVentana);

  if (ahora < inicio) {
    return (
      <span
        style={{
          fontSize: "0.85rem",
          color: "#6B7280",
          fontStyle: "italic",
        }}
      >
        Asistencia aún no disponible
      </span>
    );
  }

  if (ahora > fin) {
    return (
      <span
        style={{
          fontSize: "0.85rem",
          color: "#6B7280",
          fontStyle: "italic",
        }}
      >
        Asistencia cerrada
      </span>
    );
  }

  return (
    <button
      onClick={() => router.push(`/plataforma/asistencia/${claseId}`)}
      style={{
        background: "#22c55e",
        color: "white",
        border: "none",
        padding: "8px 16px",
        borderRadius: 8,
        fontWeight: 600,
        cursor: "pointer",
        fontSize: "0.9rem",
        transition: "opacity 0.2s ease",
      }}
      onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
      onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
    >
      Tomar asistencia
    </button>
  );
}
