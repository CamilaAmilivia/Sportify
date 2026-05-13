"use client";

const actividades = [
  {
    id: "yoga",
    nombre: "Yoga",
    emoji: "🧘",
    descripcion:
      "Encontrá el equilibrio entre cuerpo y mente. Clases para todos los niveles, con enfoque en respiración, flexibilidad y bienestar.",
    color: "rgba(91, 190, 68, 0.08)",
  },
  {
    id: "pilates",
    nombre: "Pilates",
    emoji: "🤸",
    descripcion:
      "Fortalecé el núcleo y mejorá tu postura. Un método de entrenamiento que trabaja la fuerza, la flexibilidad y la coordinación.",
    color: "rgba(28, 28, 28, 0.04)",
  },
  {
    id: "funcional",
    nombre: "Funcional",
    emoji: "💪",
    descripcion:
      "Entrenamiento de alta intensidad que mejora la fuerza, resistencia y agilidad. Adaptado a todos los niveles de condición física.",
    color: "rgba(91, 190, 68, 0.08)",
  },
];

export default function ActividadesSection() {
  return (
    <section
      id="actividades"
      style={{
        padding: "96px 24px",
        background: "var(--color-gray-light)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p
            style={{
              fontSize: "0.8rem",
              fontWeight: 700,
              color: "var(--color-green)",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Nuestras disciplinas
          </p>
          <h2 className="section-title">
            Actividades para <span>cada objetivo</span>
          </h2>
          <p
            style={{
              color: "var(--color-gray)",
              fontSize: "1.05rem",
              maxWidth: 480,
              margin: "16px auto 0",
            }}
          >
            Elegí la disciplina que mejor se adapta a tus metas y reservá tu
            lugar en segundos.
          </p>
        </div>

        {/* Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {actividades.map((act) => (
            <article
              key={act.id}
              style={{
                background: "var(--color-white)",
                borderRadius: "var(--radius-lg)",
                padding: "32px",
                boxShadow: "var(--shadow-card)",
                border: "1px solid rgba(0,0,0,0.05)",
                transition: "transform var(--transition), box-shadow var(--transition)",
                cursor: "default",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "var(--shadow-hover)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLElement).style.boxShadow =
                  "var(--shadow-card)";
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  background: act.color,
                  borderRadius: "var(--radius-md)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "2rem",
                  marginBottom: 20,
                }}
              >
                {act.emoji}
              </div>

              <h3
                style={{
                  fontSize: "1.35rem",
                  fontWeight: 800,
                  color: "var(--color-dark)",
                  marginBottom: 12,
                }}
              >
                {act.nombre}
              </h3>

              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--color-gray)",
                  lineHeight: 1.7,
                }}
              >
                {act.descripcion}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
