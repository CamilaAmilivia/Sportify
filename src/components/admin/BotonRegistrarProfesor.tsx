"use client";

import { useState } from "react";
import { FormularioRegistroProfesor } from "./FormularioRegistroProfesor";

export function BotonRegistrarProfesor() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setMostrarFormulario(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        style={{
          display: "inline-block",
          padding: "16px 24px",
          background: "#22c55e",
          color: "white",
          border: "none",
          borderRadius: 8,
          fontSize: "1rem",
          fontWeight: 600,
          cursor: "pointer",
          textDecoration: "none",
        }}
      >
        ➕ Registrar profesor
      </button>

      {mostrarFormulario && (
        <FormularioRegistroProfesor
          onClose={() => setMostrarFormulario(false)}
        />
      )}
    </>
  );
}
