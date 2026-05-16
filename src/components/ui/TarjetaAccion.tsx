import Link from "next/link";

type TarjetaAccionProps = {
  titulo: string;
  descripcion: string;
  href: string;
  icono: string;
};

export function TarjetaAccion({
  titulo,
  descripcion,
  href,
  icono,
}: TarjetaAccionProps) {
  return (
    <Link
      href={href}
      style={{
        display: "block",
        textDecoration: "none",
        background: "white",
        border: "1px solid rgba(0,0,0,0.06)",
        borderRadius: 18,
        padding: 28,
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
        color: "inherit",
      }}
    >
      <div style={{ fontSize: "2.4rem", marginBottom: 18 }}>{icono}</div>

      <h3
        style={{
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "var(--color-dark)",
          marginBottom: 10,
        }}
      >
        {titulo}
      </h3>

      <p
        style={{
          color: "var(--color-gray)",
          fontSize: "0.95rem",
        }}
      >
        {descripcion}
      </p>
    </Link>
  );
}