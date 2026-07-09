import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FormularioRestablecer from "./FormularioRestablecer";

export const metadata = {
  title: "Restablecer contraseña — Sportify",
  description: "Elige una nueva contraseña para tu cuenta de Sportify.",
};

export default function PaginaRestablecer() {
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
            maxWidth: 480,
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
              <h1
                style={{
                  fontSize: "1.6rem",
                  fontWeight: 800,
                  color: "var(--color-dark)",
                  marginBottom: 6,
                }}
              >
                Restablecer contraseña
              </h1>
              <p style={{ fontSize: "0.9rem", color: "var(--color-gray)" }}>
                Ingresa y confirma tu nueva contraseña.
              </p>
            </div>

            <Suspense fallback={<p>Cargando...</p>}>
              <FormularioRestablecer />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
