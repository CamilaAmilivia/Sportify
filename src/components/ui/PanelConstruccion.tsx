type PanelConstruccionProps = {
  titulo: string;
  descripcion: string;
  acciones?: React.ReactNode;
};

export function PanelConstruccion({
  titulo,
  descripcion,
  acciones,
}: PanelConstruccionProps) {
  return (
    <section
      style={{
        background: "white",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 18,
        padding: 32,
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <h2
        style={{
          fontSize: "1.4rem",
          fontWeight: 800,
          color: "var(--color-dark)",
          marginBottom: 8,
        }}
      >
        {titulo}
      </h2>

      <p
        style={{
          color: "var(--color-gray)",
          fontSize: "1rem",
          marginBottom: acciones ? 24 : 0,
        }}
      >
        {descripcion}
      </p>

      {acciones}
    </section>
  );
}