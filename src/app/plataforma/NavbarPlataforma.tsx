"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "./actions";
import type { UsuarioSesion } from "@/tipos/usuario";
import { navegacionPorRol, nombreRol, } from "@/configuracion/navegacion";

export default function NavbarPlataforma({ usuario, }: { usuario: UsuarioSesion; }) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();

  const itemsNavegacion = navegacionPorRol[usuario.rol];

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
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 28px",
          height: 74,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 32,
          }}
        >
          {/* Logo: no tocar */}
          <Link
            href={itemsNavegacion[0].href}
            style={{
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              transition: "transform var(--transition)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.transform = "scale(1.03)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.transform = "scale(1)")
            }
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            {itemsNavegacion.map((item) => {
              const activo = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "18px 22px",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: activo ? "white" : "var(--color-dark)",
                    background: activo ? "#22c55e" : "transparent",
                    transition: "background var(--transition)",
                  }}
                >
                  {item.nombre}
                </Link>
              );
            })}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
          }}
        >
          <button
            type="button"
            aria-label="Notificaciones"
            style={{
              position: "relative",
              background: "none",
              border: "none",
              fontSize: "1.4rem",
              cursor: "pointer",
            }}
          >
            🔔
            <span
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 9,
                height: 9,
                borderRadius: "50%",
                background: "#22c55e",
              }}
            />
          </button>

          <button
            type="button"
            onClick={() => setMenuAbierto((valor) => !valor)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 18px",
              borderRadius: 14,
              border: "1px solid rgba(0,0,0,0.08)",
              background: "white",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <span
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: "#22c55e",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              👤
            </span>
            Mi cuenta
            <span>⌄</span>
          </button>

          {menuAbierto && (
            <div
              style={{
                position: "absolute",
                top: 62,
                right: 0,
                width: 280,
                background: "white",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.08)",
                boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
                overflow: "hidden",
                zIndex: 100,
              }}
            >
              <div
                style={{
                  padding: "18px 20px 14px",
                  borderBottom: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: 800,
                    color: "var(--color-dark)",
                  }}
                >
                  {nombreRol[usuario.rol]}
                </p>

                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: "0.875rem",
                    color: "var(--color-gray)",
                  }}
                >
                  {usuario.email}
                </p>
              </div>

              <div style={{ padding: "8px 0" }}>
                <Link
                  href="/plataforma/perfil"
                  style={linkMenuCuenta}
                  onClick={() => setMenuAbierto(false)}
                >
                  👤 Ver perfil
                </Link>
              </div>

              <div
                style={{
                  borderTop: "1px solid rgba(0,0,0,0.08)",
                  padding: "8px 0",
                }}
              >
                <button
                  type="button"
                  onClick={async () => {
                    await cerrarSesion();
                  }}
                  style={{
                    width: "100%",
                    padding: "14px 20px",
                    background: "white",
                    border: "none",
                    color: "#ef4444",
                    fontWeight: 700,
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                  }}
                >
                  ↪ Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}

const linkMenuCuenta = {
  display: "block",
  padding: "14px 20px",
  textDecoration: "none",
  color: "var(--color-dark)",
  fontWeight: 600,
  fontSize: "0.95rem",
};
