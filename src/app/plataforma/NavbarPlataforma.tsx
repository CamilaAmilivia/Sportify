"use client";

import { useState } from "react";
import Link from "next/link";
import { cerrarSesion } from "./actions";

type Usuario = {
  nombre: string;
  apellido: string;
  email: string;
};

export default function NavbarPlataforma({ usuario }: { usuario: Usuario }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
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
            href="/plataforma"
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

          {/* Botón Cuenta a la derecha */}
          <div>
            <button
              onClick={() => setIsOpen(true)}
              className="btn-outline"
              style={{ padding: "8px 20px", fontSize: "0.875rem" }}
            >
              Cuenta
            </button>
          </div>
        </nav>
      </header>

      {/* Drawer Overlay */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.4)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            transition: "opacity var(--transition)",
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: isOpen ? 0 : "-400px",
          width: "100%",
          maxWidth: 360,
          height: "100vh",
          background: "var(--color-white)",
          boxShadow: "var(--shadow-card)",
          zIndex: 101,
          transition: "right var(--transition)",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header del Panel */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Mi cuenta</h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              color: "var(--color-gray)",
            }}
          >
            ✕
          </button>
        </div>

        {/* Datos del usuario */}
        <div
          style={{
            marginBottom: 32,
            padding: "8px 0",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "1.05rem",
              fontWeight: 700,
              color: "var(--color-dark)",
            }}
          >
            {usuario.nombre} {usuario.apellido}
          </p>
          <p style={{ fontSize: "0.85rem", color: "var(--color-gray)" }}>
            {usuario.email}
          </p>
        </div>

        {/* Acciones */}
        <div style={{ marginTop: "auto" }}>
          <button
            onClick={async () => {
              await cerrarSesion();
            }}
            className="btn-outline-danger"
            style={{ width: "100%" }}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
}
