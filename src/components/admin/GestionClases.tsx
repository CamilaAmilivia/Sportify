"use client";

import { useState } from "react";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion"
import { TituloPagina } from "@/components/ui/TituloPagina";
import { FormularioCrearClase } from "@/components/ui/FormularioCrearClase";

type GestionClasesProps = {
  disciplinas: Array<{ id: number; nombre: string }>;
  profesores: Array<{
    id: number;
    nombre: string;
    apellido: string;
  }>;
};

export function GestionClases({
  disciplinas,
  profesores,
}: GestionClasesProps) {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  return (
    <>
      <TituloPagina
        titulo="Gestión de clases"
        descripcion="Desde acá el administrador va a poder crear, editar, cancelar y consultar clases."
      />

      <div
        style={{
          marginBottom: 32,
        }}
      >
        <button
          type="button"
          onClick={() => {
            console.log("=== BOTÓN CREAR CLASE CLICKEADO ===");
            setMostrarFormulario(true);
          }}
          style={{
            padding: "20px 24px",
            background: "#22c55e",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 20,
          }}
        >
          ➕ Crear nueva clase
        </button>
      </div>


      <PanelConstruccion
        titulo="Listado de clases"
        descripcion="Acá luego se mostrará una tabla con las clases creadas en la base de datos."
      />

      {mostrarFormulario && (
        <FormularioCrearClase
          disciplinas={disciplinas}
          profesores={profesores}
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
