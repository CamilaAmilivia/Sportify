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
        <span
          style={{
            fontSize: "1.1rem",
            fontWeight: 800,
            color: "var(--color-white)",
          }}
        >
          Sport<span style={{ color: "var(--color-green)" }}>ify</span>
        </span>
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
