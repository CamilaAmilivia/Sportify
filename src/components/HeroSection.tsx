import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, var(--color-dark) 0%, var(--color-dark-2) 100%)",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative green glow */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-20%",
          right: "-10%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,190,68,0.18) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          bottom: "-10%",
          left: "-5%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(91,190,68,0.1) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "80px 24px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(91,190,68,0.15)",
            border: "1px solid rgba(91,190,68,0.3)",
            borderRadius: 100,
            padding: "6px 16px",
            marginBottom: 28,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "var(--color-green)",
              display: "inline-block",
              animation: "pulse 2s infinite",
            }}
          />
          <span
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-green)",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Reservas online disponibles
          </span>
        </div>

        {/* Headline */}
        <h1
          style={{
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
            fontWeight: 900,
            color: "var(--color-white)",
            lineHeight: 1.1,
            letterSpacing: "-1px",
            marginBottom: 24,
            maxWidth: 700,
          }}
        >
          Entrená con{" "}
          <span
            style={{
              color: "var(--color-green)",
              position: "relative",
            }}
          >
            propósito
          </span>
          .
          <br />
          Viví el movimiento.
        </h1>

        <p
          style={{
            fontSize: "clamp(1rem, 2vw, 1.2rem)",
            color: "rgba(255,255,255,0.65)",
            maxWidth: 520,
            marginBottom: 40,
            lineHeight: 1.7,
          }}
        >
          Yoga, Pilates y Funcional en un solo lugar. Agendá tus clases,
          seguí tu progreso y alcanzá tus metas en Sportify.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <Link
            href="/registro"
            id="btn-registro-hero"
            className="btn-primary"
            style={{ fontSize: "1rem", padding: "14px 32px" }}
          >
            Registrarse gratis
          </Link>
          <a
            href="#actividades"
            className="btn-outline-white"
            style={{ fontSize: "1rem", padding: "14px 32px" }}
          >
            Ver actividades
          </a>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "flex",
            gap: 48,
            marginTop: 72,
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "3", label: "Disciplinas" },
            { value: "5", label: "Días a la semana" },
            { value: "100%", label: "Reservas online" },
          ].map((stat) => (
            <div key={stat.label}>
              <div
                style={{
                  fontSize: "2rem",
                  fontWeight: 800,
                  color: "var(--color-green)",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.5)",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
