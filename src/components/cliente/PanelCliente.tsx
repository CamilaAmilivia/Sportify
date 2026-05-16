import { TarjetaAccion } from "../ui/TarjetaAccion"
import { TarjetaEstadistica } from "../ui/TarjetaEstadistica";
import { TituloPagina } from "../ui/TituloPagina";

const estadisticasCliente = [
  {
    titulo: "Clases este mes",
    valor: "12",
    icono: "▣",
  },
  {
    titulo: "Próxima clase",
    valor: "Hoy 18:00",
    icono: "🕒",
  },
  {
    titulo: "Asistencia mensual",
    valor: "90%",
    icono: "↗",
  },
];

const proximasClases = [
  {
    id: 1,
    nombre: "Yoga",
    dia: "Lunes",
    horario: "18:00",
    profesor: "María García",
    icono: "🧘",
  },
  {
    id: 2,
    nombre: "Pilates",
    dia: "Miércoles",
    horario: "19:00",
    profesor: "Juan Pérez",
    icono: "🤸",
  },
];

export function PanelCliente() {
  return (
    <>
      <TituloPagina
        titulo="Bienvenido a Sportify"
        descripcion="Desde acá vas a poder consultar el cronograma y gestionar tus clases."
      />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 20,
          marginBottom: 32,
        }}
      >
        {estadisticasCliente.map((item) => (
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
          titulo="Ver Cronograma"
          descripcion="Explorá las clases disponibles esta semana."
          href="/plataforma/cronograma"
          icono="▣"
        />

        <TarjetaAccion
          titulo="Mis Clases"
          descripcion="Consultá y gestioná tus clases reservadas."
          href="/plataforma/mis-clases"
          icono="▤"
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
          Mis próximas clases
        </h2>

        <div style={{ display: "grid", gap: 14 }}>
          {proximasClases.map((clase) => (
            <article
              key={clase.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
                padding: 18,
                borderRadius: 14,
                background: "#f8fafc",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <div
                  style={{
                    width: 54,
                    height: 54,
                    borderRadius: 14,
                    background: "#22c55e",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.7rem",
                  }}
                >
                  {clase.icono}
                </div>

                <div>
                  <h3
                    style={{
                      color: "var(--color-dark)",
                      fontWeight: 800,
                      marginBottom: 4,
                    }}
                  >
                    {clase.nombre}
                  </h3>

                  <p style={{ color: "var(--color-gray)" }}>
                    {clase.dia} {clase.horario} • {clase.profesor}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}