"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error" | "warning";

type ToastProps = {
  mensaje: string;
  tipo: ToastType;
  duracion?: number;
  onClose: () => void;
};

export function Toast({ mensaje, tipo, duracion = 8000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, duracion);

    return () => clearTimeout(timer);
  }, [duracion, onClose]);

  const coloresBase = {
    success: {
      bg: "#dcfce7",
      border: "#86efac",
      text: "#166534",
      icon: "✓",
    },
    error: {
      bg: "#fee2e2",
      border: "#fecaca",
      text: "#b91c1c",
      icon: "✕",
    },
    warning: {
      bg: "#fef3c7",
      border: "#fde68a",
      text: "#92400e",
      icon: "⚠",
    },
  };

  const colores = coloresBase[tipo];

  return (
    <div
      style={{
        position: "fixed",
        top: "20px",
        right: "20px",
        zIndex: 2000,
        animation: isVisible ? "slideIn 0.3s ease-out" : "slideOut 0.3s ease-in",
        background: colores.bg,
        border: `1px solid ${colores.border}`,
        borderRadius: "8px",
        padding: "16px 20px",
        boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
        maxWidth: "400px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideOut {
          from {
            opacity: 1;
            transform: translateX(0);
          }
          to {
            opacity: 0;
            transform: translateX(100%);
          }
        }
      `}</style>
      <span
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: colores.text,
          flexShrink: 0,
        }}
      >
        {colores.icon}
      </span>
      <span
        style={{
          color: colores.text,
          fontWeight: "600",
          fontSize: "0.95rem",
          lineHeight: "1.4",
        }}
      >
        {mensaje}
      </span>
    </div>
  );
}
