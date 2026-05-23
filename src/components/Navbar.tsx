"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            transition: "transform var(--transition)",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          <img
            src="/logo.svg"
            alt="Sportify Logo"
            style={{
              height: 44,
              width: "auto",
              objectFit: "contain",
            }}
          />
        </Link>

        {/* Nav links */}
        <div
          style={{
            display: "flex",
            gap: "clamp(12px, 3vw, 32px)",
            alignItems: "center",
          }}
        >
          <NavLink href="/#actividades">Actividades</NavLink>
          <NavLink href="/#info">Contacto</NavLink>
        </div>

        {/* Auth buttons */}
        <div style={{ display: "flex", gap: "clamp(6px, 1.5vw, 12px)", alignItems: "center" }}>
          <Link
            href="/login"
            id="btn-login"
            className="btn-outline"
            style={{
              padding: "clamp(6px, 1.5vw, 9px) clamp(10px, 2.5vw, 22px)",
              fontSize: "clamp(0.65rem, 2.2vw, 0.875rem)",
              whiteSpace: "nowrap",
            }}
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            id="btn-registro-nav"
            className="btn-primary"
            style={{
              padding: "clamp(6px, 1.5vw, 9px) clamp(10px, 2.5vw, 22px)",
              fontSize: "clamp(0.65rem, 2.2vw, 0.875rem)",
              whiteSpace: "nowrap",
            }}
          >
            Registrarse
          </Link>
        </div>
      </nav>
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        fontSize: "0.9rem",
        fontWeight: 500,
        color: "var(--color-gray)",
        textDecoration: "none",
        transition: "color var(--transition)",
      }}
      onMouseEnter={(e) =>
        ((e.target as HTMLElement).style.color = "var(--color-green)")
      }
      onMouseLeave={(e) =>
        ((e.target as HTMLElement).style.color = "var(--color-gray)")
      }
    >
      {children}
    </a>
  );
}
