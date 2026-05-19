"use client";

import { useState } from "react";
import { FormularioCrearClase } from "../ui/FormularioCrearClase";

type BotonCrearClaseProps = {
  disciplinas: Array<{ id: number; nombre: string }>;
};

export function BotonCrearClase({ disciplinas }: BotonCrearClaseProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("CLICK DETECTADO EN BOTON");
    setMostrarFormulario(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: "block",
          width: "100%",
          textDecoration: "none",
          background: "white",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
          color: "inherit",
          cursor: "pointer",
          textAlign: "left" as const,
          transition: "all 0.3s ease",
          fontFamily: "inherit",
          fontSize: "inherit",
        }}
      >
        <div style={{ fontSize: "2.4rem", marginBottom: 18 }}>➕</div>

        <h3
          style={{
            fontSize: "1.2rem",
            fontWeight: 800,
            color: "var(--color-dark)",
            marginBottom: 10,
            margin: 0,
          }}
        >
          Crear Clase
        </h3>

        <p
          style={{
            color: "var(--color-gray)",
            fontSize: "0.95rem",
            margin: 0,
            marginTop: 8,
          }}
        >
          Agregar una nueva clase al cronograma.
        </p>
      </button>

      {mostrarFormulario && (
        <FormularioCrearClase
          disciplinas={disciplinas}
          onClose={() => setMostrarFormulario(false)}
          onSuccess={() => {
            setMostrarFormulario(false);
            window.location.reload();
          }}
        />
      )}
    </>
  );
}
