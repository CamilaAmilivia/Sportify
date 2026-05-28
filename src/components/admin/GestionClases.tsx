"use client";

import { useState } from "react";
import { PanelConstruccion } from "@/components/ui/PanelConstruccion"
import { TarjetaAccion } from "@/components/ui/TarjetaAccion"
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
        titulo="Gestión de Clases"
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
          ➕ Crear Nueva Clase
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <TarjetaAccion
          titulo="Ver cronograma"
          descripcion="Consultar las clases cargadas por fecha y disciplina."
          href="#"
          icono="▣"
        />

        <TarjetaAccion
          titulo="Clases canceladas"
          descripcion="Revisar clases canceladas o finalizadas."
          href="#"
          icono="⚠️"
        />
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
