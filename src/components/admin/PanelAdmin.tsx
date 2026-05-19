"use client";

import { TarjetaAccion } from "../ui/TarjetaAccion";
import { TarjetaEstadistica } from "../ui/TarjetaEstadistica";
import { TituloPagina } from "../ui/TituloPagina";

const estadisticasAdmin = [
  {
    titulo: "Usuarios activos",
    valor: "156",
    icono: "👥",
  },
  {
    titulo: "Clases esta semana",
    valor: "48",
    icono: "▣",
  },
  {
    titulo: "Profesores activos",
    valor: "12",
    icono: "🧑‍🏫",
  },
  {
    titulo: "Asistencia promedio",
    valor: "87%",
    icono: "↗",
  },
];

const actividadReciente = [
  {
    id: 1,
    titulo: "Ana López",
    descripcion: "se inscribió a Yoga - Lunes 18:00",
    tiempo: "Hace 2 minutos",
  },
  {
    id: 2,
    titulo: "Clase actualizada",
    descripcion: "Pilates cambió su horario a las 19:00",
    tiempo: "Hace 15 minutos",
  },
];

type PanelAdminProps = {
  disciplinas?: Array<{ id: number; nombre: string }>;
};

export function PanelAdmin({ disciplinas = [] }: PanelAdminProps) {
  return (
    <>
      <TituloPagina titulo="Panel de Administración" />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {estadisticasAdmin.map((item) => (
          <TarjetaEstadistica
            key={item.titulo}
            titulo={item.titulo}
            valor={item.valor}
            icono={item.icono}
          />
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        <TarjetaAccion
          titulo="Gestionar Clases"
          descripcion="Crear, editar y cancelar clases del cronograma."
          href="/plataforma/clases"
          icono="▣"
        />

        <TarjetaAccion
          titulo="Gestionar Profesores"
          descripcion="Administrar profesores y asignaciones."
          href="/plataforma/profesores"
          icono="👥"
        />

        <TarjetaAccion
          titulo="Gestionar Usuarios"
          descripcion="Ver clientes registrados y su información."
          href="/plataforma/usuarios"
          icono="👤"
        />
      </section>

      <section
        style={{
          background: "white",
          border: "1px solid rgba(0,0,0,0.06)",
          borderRadius: 18,
          padding: 28,
          boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        }}
      >
        <h2
          style={{
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "var(--color-dark)",
            marginBottom: 20,
          }}
        >
          Actividad reciente
        </h2>

        <div style={{ display: "grid", gap: 14 }}>
          {actividadReciente.map((item) => (
            <article
              key={item.id}
              style={{
                display: "flex",
                gap: 14,
                padding: 18,
                borderRadius: 14,
                background: "#f8fafc",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  marginTop: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                }}
              />

              <div>
                <p style={{ color: "var(--color-dark)", fontWeight: 600 }}>
                  <strong>{item.titulo}</strong> {item.descripcion}
                </p>

                <p
                  style={{
                    color: "var(--color-gray)",
                    fontSize: "0.85rem",
                    marginTop: 4,
                  }}
                >
                  {item.tiempo}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}