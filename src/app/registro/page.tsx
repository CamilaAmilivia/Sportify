import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormularioRegistro from "./FormularioRegistro";

export const metadata = {
  title: "Registro — Sportify",
  description: "Creá tu cuenta en Sportify y empezá a entrenar con nosotros.",
};

export default function PaginaRegistro() {
  return (
    <>
      <Navbar />
      <main
        style={{
          minHeight: "calc(100vh - 68px)",
          background: "var(--color-gray-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 560,
          }}
        >
          {/* Card */}
          <div
            style={{
              background: "var(--color-white)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)",
              padding: "40px 40px",
              border: "1px solid rgba(0,0,0,0.05)",
            }}
          >
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <Link
                href="/"
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 800,
                  color: "var(--color-dark)",
                  textDecoration: "none",
                  display: "inline-block",
                  marginBottom: 24,
                }}
              >
                Sport<span style={{ color: "var(--color-green)" }}>ify</span>
              </Link>
              <h1
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--color-dark)",
                  marginBottom: 6,
                }}
              >
                Crear cuenta
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--color-gray)" }}>
                Completá tus datos para empezar a entrenar con nosotros.
              </p>
            </div>

            <FormularioRegistro />

            {/* Footer del card */}
            <p
              style={{
                textAlign: "center",
                fontSize: "0.85rem",
                color: "var(--color-gray)",
                marginTop: 24,
              }}
            >
              ¿Ya tenés cuenta?{" "}
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-green)",
                  fontWeight: 600,
                  cursor: "not-allowed",
                  fontSize: "inherit",
                }}
                disabled
                title="Próximamente"
              >
                Iniciar sesión
              </button>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
