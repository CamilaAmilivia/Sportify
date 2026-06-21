"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion, verificarNotificacionCupoLiberado } from "./actions";
import type { UsuarioSesion } from "@/tipos/usuario";
import { navegacionPorRol, nombreRol } from "@/configuracion/navegacion";
import type { NotificacionCupoLiberado } from "@/lib/notificaciones";

/* ─── Constantes de color (token → value literal para inline-safety) ─── */
const GREEN = "#22c55e";
const DARK = "#1C1C1C";
const GRAY = "#6B7280";

export default function NavbarPlataforma({
  usuario,
  notificacionCupoLiberado: notificacionInicial,
}: {
  usuario: UsuarioSesion;
  notificacionCupoLiberado?: NotificacionCupoLiberado | null;
}) {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [notificacionAbierta, setNotificacionAbierta] = useState(false);
  const [notificacionCupoLiberado, setNotificacionCupoLiberado] = useState(
    notificacionInicial ?? null
  );
  const pathname = usePathname();
  const itemsNavegacion = navegacionPorRol[usuario.rol];

  function refrescarNotificacion() {
    verificarNotificacionCupoLiberado()
      .then(setNotificacionCupoLiberado)
      .catch(() => {});
  }

  useEffect(() => {
    refrescarNotificacion();
  }, [pathname]);

  useEffect(() => {
    if (!menuAbierto && !notificacionAbierta) {
      return;
    }

    function handleClickFuera(event: MouseEvent) {
      const target = event.target as HTMLElement;

      if (!target.closest("[data-menu-cuenta]")) {
        setMenuAbierto(false);
      }

      if (!target.closest("[data-menu-notificacion]")) {
        setNotificacionAbierta(false);
      }
    }

    document.addEventListener("mousedown", handleClickFuera);
    return () => document.removeEventListener("mousedown", handleClickFuera);
  }, [menuAbierto, notificacionAbierta]);

  const dropdownNotificacion = notificacionAbierta && notificacionCupoLiberado && (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 300,
        background: "white",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
        overflow: "hidden",
        zIndex: 200,
        padding: 18,
      }}
    >
      <p style={{ margin: 0, fontWeight: 800, color: DARK, fontSize: "0.95rem" }}>
        🎉 ¡Se liberó un cupo!
      </p>
      <p style={{ margin: "8px 0 0", fontSize: "0.85rem", color: GRAY }}>
        Hay un lugar disponible en <strong>{notificacionCupoLiberado.titulo}</strong>
        {" "}
        (
        {new Date(notificacionCupoLiberado.fechaHora).toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
        })}
        ). Confirmá tu inscripción antes de que se ocupe.
      </p>
      <Link
        href={`/plataforma/cronograma?claseId=${notificacionCupoLiberado.claseId}&vista=resumen&tipoPago=CLASE_INDIVIDUAL`}
        onClick={() => setNotificacionAbierta(false)}
        style={{
          display: "block",
          textAlign: "center",
          marginTop: 14,
          borderRadius: 8,
          padding: "10px 14px",
          background: GREEN,
          color: "white",
          fontWeight: 700,
          fontSize: "0.9rem",
          textDecoration: "none",
        }}
      >
        Confirmar inscripción
      </Link>
    </div>
  );

  /* Dropdown "Mi cuenta" compartido entre desktop y mobile */
  const dropdownMenu = menuAbierto && (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 8px)",
        right: 0,
        width: 280,
        background: "white",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 12px 32px rgba(0,0,0,0.12)",
        overflow: "hidden",
        zIndex: 200,
      }}
    >
      {/* Info usuario */}
      <div
        style={{
          padding: "20px 22px 16px",
          borderBottom: "1px solid rgba(0,0,0,0.07)",
        }}
      >
        <p style={{ margin: 0, fontWeight: 800, color: DARK }}>
          {nombreRol[usuario.rol]}
        </p>
        <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: GRAY }}>
          {usuario.email}
        </p>
      </div>

      {/* Ver perfil */}
      <div style={{ padding: "6px 0" }}>
        <Link
          href="/plataforma/perfil"
          onClick={() => setMenuAbierto(false)}
          style={{
            display: "block",
            padding: "13px 22px",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: DARK,
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#f5f5f5")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "transparent")
          }
        >
          👤 Ver perfil
        </Link>
      </div>

      {/* Cerrar sesión */}
      <div style={{ borderTop: "1px solid rgba(0,0,0,0.07)", padding: "6px 0" }}>
        <button
          type="button"
          onClick={async () => {
            await cerrarSesion();
          }}
          style={{
            width: "100%",
            padding: "13px 22px",
            background: "white",
            border: "none",
            color: "#ef4444",
            fontWeight: 700,
            textAlign: "left",
            cursor: "pointer",
            fontSize: "0.95rem",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "#fef2f2")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLElement).style.background = "white")
          }
        >
          ↪ Cerrar sesión
        </button>
      </div>
    </div>
  );

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(255,255,255,0.96)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {/* ════════════════ DESKTOP (≥768px) ════════════════ */}
      <nav
        style={{
          display: "none",
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 32px",
          height: 74,
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
        }}
        className="md-flex"
      >
        {/* Grupo izquierdo: logo + links */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              src="/logo.svg"
              alt="Sportify Logo"
              style={{ height: 44, width: "auto", objectFit: "contain" }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {itemsNavegacion.map((item) => {
              const activo = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={refrescarNotificacion}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "10px 20px",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: activo ? "white" : DARK,
                    background: activo ? GREEN : "transparent",
                    transition: "background 0.18s, color 0.18s",
                  }}
                  onMouseEnter={(e) => {
                    if (!activo)
                      (e.currentTarget as HTMLElement).style.background =
                        "rgba(0,0,0,0.05)";
                  }}
                  onMouseLeave={(e) => {
                    if (!activo)
                      (e.currentTarget as HTMLElement).style.background =
                        "transparent";
                  }}
                >
                  {item.nombre}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Grupo derecho: notificaciones + Mi cuenta */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            position: "relative",
          }}
        >
          <div style={{ position: "relative" }} data-menu-notificacion>
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => setNotificacionAbierta((v) => !v)}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                padding: "4px",
                lineHeight: 1,
              }}
            >
              🔔
              {notificacionCupoLiberado && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: GREEN,
                  }}
                />
              )}
            </button>
            {dropdownNotificacion}
          </div>

          <div style={{ position: "relative" }} data-menu-cuenta>
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 20px",
                borderRadius: 14,
                border: "1px solid rgba(0,0,0,0.09)",
                background: "white",
                fontSize: "0.95rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "white")
              }
            >
              Mi cuenta <span style={{ fontSize: "0.75rem" }}>▾</span>
            </button>
            {dropdownMenu}
          </div>
        </div>
      </nav>

      {/* ════════════════ MOBILE (<768px) ════════════════ */}
      <nav
        style={{ display: "flex", flexDirection: "column", width: "100%" }}
        className="mobile-nav"
      >
        {/* Fila superior: Logo ← · → Notificaciones */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 24px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "center" }}
          >
            <img
              src="/logo.svg"
              alt="Sportify Logo"
              style={{ height: 40, width: "auto", objectFit: "contain" }}
            />
          </div>

          <div style={{ position: "relative" }} data-menu-notificacion>
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => setNotificacionAbierta((v) => !v)}
              style={{
                position: "relative",
                background: "none",
                border: "none",
                fontSize: "1.4rem",
                cursor: "pointer",
                padding: "4px",
                lineHeight: 1,
              }}
            >
              🔔
              {notificacionCupoLiberado && (
                <span
                  style={{
                    position: "absolute",
                    top: 2,
                    right: 2,
                    width: 9,
                    height: 9,
                    borderRadius: "50%",
                    background: GREEN,
                  }}
                />
              )}
            </button>
            {dropdownNotificacion}
          </div>
        </div>

        {/* Filas de navegación: un botón por fila */}
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          {itemsNavegacion.map((item) => {
            const activo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={refrescarNotificacion}
                style={{
                  display: "block",
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(0,0,0,0.06)",
                  fontWeight: 600,
                  fontSize: "1rem",
                  textDecoration: "none",
                  color: activo ? "white" : DARK,
                  background: activo ? GREEN : "transparent",
                  transition: "background 0.15s",
                }}
              >
                {item.nombre}
              </Link>
            );
          })}

          {/* Fila: Mi cuenta (dropdown) */}
          <div
            style={{
              position: "relative",
              borderBottom: "1px solid rgba(0,0,0,0.06)",
            }}
            data-menu-cuenta
          >
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              style={{
                display: "flex",
                width: "100%",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 24px",
                background: "white",
                border: "none",
                fontWeight: 700,
                fontSize: "1rem",
                color: DARK,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "#f5f5f5")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLElement).style.background = "white")
              }
            >
              Mi cuenta{" "}
              <span style={{ fontSize: "0.75rem", color: GRAY }}>
                {menuAbierto ? "▴" : "▾"}
              </span>
            </button>
            {dropdownMenu}
          </div>
        </div>
      </nav>

      {/* ─── Media query: mostrar/ocultar según breakpoint ─── */}
      <style>{`
        @media (min-width: 768px) {
          nav.md-flex   { display: flex !important; }
          nav.mobile-nav { display: none !important; }
        }
        @media (max-width: 767px) {
          nav.md-flex   { display: none !important; }
          nav.mobile-nav { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
