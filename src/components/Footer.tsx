export default function Footer() {
  return (
    <footer
      style={{
        background: "#111111",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px 24px",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div
          style={{
            background: "var(--color-white)",
            padding: "6px 12px",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src="/logo.svg"
            alt="Sportify Logo"
            style={{
              height: 28,
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>
        <p
          style={{
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          © {new Date().getFullYear()} Sportify. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
