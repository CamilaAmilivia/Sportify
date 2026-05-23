"use client";

// Icono de Instagram inline (sin dependencia de librería)
function InstagramIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

const infoItems = [
  {
    id: "ubicacion",
    icon: "📍",
    titulo: "Dirección",
    lineas: ["Av. 7 Nro. 100", "La Plata, Provincia de Buenos Aires"],
  },
  {
    id: "horario",
    icon: "🕐",
    titulo: "Horarios",
    lineas: [
      "Lunes a viernes: 8:00 – 20:00",
      "Sábados: 8:00 – 13:00",
      "Domingos: Cerrado",
    ],
  },
  {
    id: "contacto",
    icon: "📞",
    titulo: "Contacto",
    lineas: ["Tel: (011) 1234-5678", "info@sportify.com.ar"],
  },
];

export default function InfoSection() {
  return (
    <section
      id="info"
      style={{
        padding: "96px 24px",
        background: "var(--color-dark)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 64 }}>
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
            Encontranos
          </p>
          <h2
            style={{
              fontSize: "clamp(1.75rem, 3vw, 2.5rem)",
              fontWeight: 800,
              color: "var(--color-white)",
              lineHeight: 1.2,
            }}
          >
            Información y <span style={{ color: "var(--color-green)" }}>contacto</span>
          </h2>
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: 24,
            marginBottom: 48,
          }}
        >
          {infoItems.map((item) => (
            <div
              key={item.id}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "var(--radius-md)",
                padding: "28px 24px",
              }}
            >
              <div style={{ fontSize: "1.75rem", marginBottom: 14 }}>
                {item.icon}
              </div>
              <h3
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  color: "var(--color-green)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                {item.titulo}
              </h3>
              {item.lineas.map((linea) => (
                <p
                  key={linea}
                  style={{
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.65)",
                    lineHeight: 1.7,
                  }}
                >
                  {linea}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(91,190,68,0.1)",
            border: "1px solid rgba(91,190,68,0.25)",
            borderRadius: "var(--radius-md)",
            padding: "24px 32px",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p
              style={{
                fontWeight: 700,
                color: "var(--color-white)",
                fontSize: "1rem",
                marginBottom: 4,
              }}
            >
              Seguinos en Instagram
            </p>
            <p
              style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Novedades, clases y promociones todos los días
            </p>
          </div>
          <a
            href="https://instagram.com/sportify"
            target="_self"
            id="link-instagram"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "linear-gradient(135deg, #E1306C, #C13584, #833AB4)",
              color: "var(--color-white)",
              padding: "12px 24px",
              borderRadius: "var(--radius-sm)",
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              transition: "opacity var(--transition), transform var(--transition)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "0.9";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.opacity = "1";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <InstagramIcon />
            @sportify
          </a>
        </div>
      </div>
    </section>
  );
}
